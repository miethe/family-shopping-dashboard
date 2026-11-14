from pathlib import Path
import subprocess,os,time,urllib.request,json,signal,traceback
root=Path.cwd();out=root/'.aos-archaeology';procs=[];logs=[];results={'fake_data_only':True,'api':[]}
env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','DATABASE_URL':'postgresql+psycopg://postgres:archaeology-demo@127.0.0.1:15442/family_archaeology','CORS_ORIGINS':'http://localhost:3030,http://127.0.0.1:3030','UPLOAD_DIR':str(out/'uploads'),'PUBLIC_API_URL':'http://localhost:8030','NEXT_PUBLIC_API_URL':'http://localhost:8030/api/v1','NEXT_PUBLIC_WS_URL':'ws://localhost:8030/ws','NEXT_TELEMETRY_DISABLED':'1'}
(out/'uploads').mkdir(exist_ok=True)
def start(name,cmd,cwd):
 f=(out/(name+'.log')).open('w');logs.append(f);f.write('$ '+' '.join(cmd)+'\n');f.flush();p=subprocess.Popen(cmd,cwd=cwd,env=env,stdout=f,stderr=subprocess.STDOUT,start_new_session=True);procs.append((name,p));return p
def wait(url):
 for _ in range(180):
  try:
   with urllib.request.urlopen(url,timeout=2) as r:return r.status
  except Exception:time.sleep(1)
 raise RuntimeError('Readiness timeout '+url)
def request(method,path,data=None,token=None):
 req=urllib.request.Request('http://localhost:8030'+path,data=json.dumps(data).encode() if data is not None else None,method=method,headers={'Content-Type':'application/json',**({'Authorization':'Bearer '+token} if token else {})})
 try:
  with urllib.request.urlopen(req,timeout=20) as r:status=r.status;body=json.load(r) if status!=204 else None
 except urllib.error.HTTPError as e:status=e.code;body=e.read().decode()
 results['api'].append({'method':method,'path':path,'status':status,'body':({k:v for k,v in body.items() if k!='token'} if isinstance(body,dict) else body)})
 (out/'run-results.json').write_text(json.dumps(results,indent=2));return status,body
try:
 start('postgres',[str(out/'pg-runtime/node_modules/@embedded-postgres/darwin-arm64/native/bin/postgres'),'-D',str(out/'postgres-data'),'-p','15442','-h','127.0.0.1','-k',''],root)
 for _ in range(30):
  try:
   import socket
   with socket.create_connection(('127.0.0.1',15442),timeout=1):break
  except OSError:time.sleep(1)
 start('api',[str(root/'services/api/.venv/bin/uvicorn'),'app.main:app','--host','127.0.0.1','--port','8030'],root/'services/api');wait('http://localhost:8030/health')
 request('GET','/health')
 request('POST','/api/v1/auth/register',{'email':'archaeology-demo@example.invalid','password':'FakeDemoOnly2026!'})
 status,login=request('POST','/api/v1/auth/login',{'email':'archaeology-demo@example.invalid','password':'FakeDemoOnly2026!'})
 start('web',['pnpm','dev','--hostname','127.0.0.1','--port','3030'],out/'web-runtime');wait('http://localhost:3030/login')
 cap=subprocess.run(['timeout','540','node',str(out/'capture.cjs')],cwd=root,env=env,capture_output=True,text=True)
 (out/'capture.log').write_text('$ node .aos-archaeology/capture.cjs\n'+cap.stdout+cap.stderr+'\nEXIT '+str(cap.returncode));results['capture_exit']=cap.returncode
except Exception as e:
 results['error']=str(e);traceback.print_exc()
finally:
 results['processes']=[]
 for name,p in reversed(procs):
  try:os.killpg(p.pid,signal.SIGTERM)
  except ProcessLookupError:pass
  try:p.wait(timeout=25)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()
  results['processes'].append({'name':name,'pid':p.pid,'exit':p.returncode,'stopped':p.poll() is not None})
 for f in logs:f.close()
 (out/'run-results.json').write_text(json.dumps(results,indent=2));print(json.dumps({'capture_exit':results.get('capture_exit'),'error':results.get('error'),'api':[(x['path'],x['status']) for x in results['api']],'processes':results['processes']},indent=2))
