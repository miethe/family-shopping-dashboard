import EmbeddedPostgres from './pg-runtime/node_modules/embedded-postgres/dist/index.js';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
const root=process.cwd(), out=path.join(root,'.aos-archaeology');
const pg=new EmbeddedPostgres({databaseDir:path.join(out,'postgres-data'),user:'postgres',password:'archaeology-demo',port:15442,persistent:true,postgresFlags:['-h','127.0.0.1','-k','']});
try {
 await pg.start();await pg.createDatabase('family_archaeology');
 const env={...process.env,PYTHONDONTWRITEBYTECODE:'1',DATABASE_URL:'postgresql+psycopg://postgres:archaeology-demo@127.0.0.1:15442/family_archaeology'};
 const result=spawnSync(path.join(root,'services/api/.venv/bin/alembic'),['upgrade','head'],{cwd:path.join(root,'services/api'),env,encoding:'utf8',timeout:180000});
 console.log('$ .venv/bin/alembic upgrade head\n'+result.stdout+result.stderr+'\nEXIT '+result.status);
} finally {await pg.stop();}
