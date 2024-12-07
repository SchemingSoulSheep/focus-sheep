// https://dev.to/awohletz/running-prisma-migrate-in-an-electron-app-1ehm
// https://github.com/awohletz/electron-prisma-trpc-example

import { app } from 'electron';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { fork } from 'child_process';
import log from 'electron-log';

const platformToExecutables: any = {
  win32: {
    migrationEngine: 'node_modules/@prisma/engines/schema-engine-windows.exe',
    queryEngine: 'node_modules/@prisma/engines/query_engine-windows.dll.node',
  },
  linux: {
    migrationEngine: 'node_modules/@prisma/engines/schema-engine-debian-openssl-1.1.x',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-debian-openssl-1.1.x.so.node'
  },
  darwin: {
    migrationEngine: 'node_modules/@prisma/engines/schema-engine-darwin',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin.dylib.node'
  },
  darwinArm64: {
    migrationEngine: 'node_modules/@prisma/engines/schema-engine-darwin-arm64',
    queryEngine: 'node_modules/@prisma/engines/libquery_engine-darwin-arm64.dylib.node',
  }
};
const extraResourcesPath = app.getAppPath().replace('app.asar', 'app.asar.unpacked');

function getPlatformName(): string {
  const isDarwin = process.platform === "darwin";
  if (isDarwin && process.arch === "arm64") {
    return process.platform + "Arm64";
  }

  return process.platform;
}

const platformName = getPlatformName();

const mePath = path.join(
  extraResourcesPath,
  platformToExecutables[platformName].migrationEngine
);
const qePath = path.join(
  extraResourcesPath,
  platformToExecutables[platformName].queryEngine
);

export const dbPath = path.join(app.getPath('userData'), 'sheep.db');

export const db = new PrismaClient({
    datasources: {
      db: {
        url: `file:${dbPath}`
      }
    }
  });

export async function runPrismaCommand({command, dbUrl}: {
    command: string[];
    dbUrl: string;
  }): Promise<number> {
  
  
  
    log.info("Migration engine path", mePath);
    log.info("Query engine path", qePath);
  
    // Currently we don't have any direct method to invoke prisma migration programatically.
    // As a workaround, we spawn migration script as a child process and wait for its completion.
    // Please also refer to the following GitHub issue: https://github.com/prisma/prisma/issues/4703
    try {
      const exitCode = await new Promise((resolve, _) => {
        const prismaPath = path.resolve(__dirname, "..", "..", "node_modules/prisma/build/index.js");
        log.info("Prisma path", prismaPath);
  
        const child = fork(
          prismaPath,
          command,
          {
            env: {
              ...process.env,
              DATABASE_URL: dbUrl,
              PRISMA_SCHEMA_ENGINE_BINARY: mePath,
              PRISMA_QUERY_ENGINE_LIBRARY: qePath,
  
              // Prisma apparently needs a valid path for the format and introspection binaries, even though
              // we don't use them. So we just point them to the query engine binary. Otherwise, we get
              // prisma:  Error: ENOTDIR: not a directory, unlink '/some/path/electron-prisma-trpc-example/packed/mac-arm64/ElectronPrismaTrpcExample.app/Contents/Resources/app.asar/node_modules/@prisma/engines/prisma-fmt-darwin-arm64'
              PRISMA_FMT_BINARY: qePath,
              PRISMA_INTROSPECTION_ENGINE_BINARY: qePath
            },
            stdio: "pipe"
          }
        );
  
        child.on("message", msg => {
          log.info(msg);
        })
  
        child.on("error", err => {
          log.error("Child process got error:", err);
        });
  
        child.on("close", (code, signal) => {
          resolve(code);
        })
  
        child.stdout?.on('data',function(data){
          log.info("prisma: ", data.toString());
        });
  
        child.stderr?.on('data',function(data){
          log.error("prisma: ", data.toString());
        });
      });
  
      if (exitCode !== 0) throw Error(`command ${command} failed with exit code ${exitCode}`);
  
      return exitCode;
    } catch (e) {
      log.error(e);
      throw e;
    }
  }