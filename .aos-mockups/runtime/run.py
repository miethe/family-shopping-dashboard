from pathlib import Path
import os,subprocess,json,time,signal,urllib.request,urllib.error,socket
root=Path.cwd();out=root/'.aos-mockups';rt=out/'runtime';py=rt/'python/bin/python';procs=[];logs=[]
env={**os.environ,'PYTHONDONTWRITEBYTECODE':'1','PYTHONPATH':str(root/'services/api'),'DATABASE_URL':'postgresql+psycopg://postgres:mockup-local-only@127.0.0.1:15453/gather_mockup','CORS_ORIGINS':'http://localhost:18330,http://127.0.0.1:18330','UPLOAD_DIR':str(rt/'uploads'),'NEXT_PUBLIC_API_URL':'http://127.0.0.1:18430/api/v1','NEXT_PUBLIC_WS_URL':'ws://127.0.0.1:18430/ws','NEXT_TELEMETRY_DISABLED':'1'}
results={'fake_data_only':True,'database':'new isolated cluster under .aos-mockups/runtime/postgres on loopback:15453','api':[],'source_edits':[]}
def save(): (out/'runtime-results.json').write_text(json.dumps(results,indent=2))
def start(n,cmd,cwd=root):
 f=(rt/(n+'.log')).open('w');logs.append(f);p=subprocess.Popen(list(map(str,cmd)),cwd=cwd,env=env,stdout=f,stderr=subprocess.STDOUT,start_new_session=True);procs.append((n,p));return p
def run(cmd,cwd=root):
 r=subprocess.run(list(map(str,cmd)),cwd=cwd,env=env,capture_output=True,text=True,timeout=180);(rt/'setup.log').open('a').write(r.stdout+r.stderr);r.check_returncode();return r

def req(method,path,data=None,token=None,required=True):
 q=urllib.request.Request('http://127.0.0.1:18430'+path,method=method,data=json.dumps(data).encode() if data is not None else None,headers={'Content-Type':'application/json',**({'Authorization':'Bearer '+token} if token else {})})
 try:
  with urllib.request.urlopen(q,timeout=30) as r:status=r.status;body=json.load(r) if status!=204 else None
 except urllib.error.HTTPError as e:status=e.code;body=e.read().decode()
 clean={k:v for k,v in body.items() if k not in ['token','access_token']} if isinstance(body,dict) else body
 results['api'].append({'method':method,'path':path,'status':status,'response':clean});save()
 if required and status>=400:raise RuntimeError(f'{method} {path}: {status} {body}')
 return status,body
try:
 start('postgres',[rt/'pg-bin/postgres','-D',rt/'postgres','-p','15453','-h','127.0.0.1','-k',''])
 for i in range(30):
  try:
   with socket.create_connection(('127.0.0.1',15453),timeout=1):break
  except OSError:time.sleep(1)
 if not (rt/'capture-config.json').exists():
  run([py,'-c',"import psycopg; c=psycopg.connect('host=127.0.0.1 port=15453 dbname=postgres user=postgres',autocommit=True); c.execute('CREATE DATABASE gather_mockup');c.close()"])
  run([py,'-m','alembic','upgrade','head'],root/'services/api')
  # Verify the migration result before restoring only the missing table in this scratch DB.
  run([py,'-c',"import psycopg; c=psycopg.connect('host=127.0.0.1 port=15453 dbname=gather_mockup user=postgres'); print('activity_logs before repair:',c.execute(\"select to_regclass('public.activity_logs')\").fetchone());c.close()"])
  run([py,'-c',"from sqlalchemy import create_engine; from app.models.activity import ActivityLog; import app.models; import os; e=create_engine(os.environ['DATABASE_URL']); ActivityLog.__table__.create(e,checkfirst=True); print('Scratch-only ActivityLog table recreated from ORM metadata')"])
  results['scratch_repair']='Recreated ActivityLog.__table__ after alembic upgrade head; no migration or source edits';save()
 start('api',[py,'-m','uvicorn','app.main:app','--host','127.0.0.1','--port','18430'],root/'services/api')
 for i in range(60):
  try:req('GET','/health');break
  except Exception:time.sleep(1)
 if not (rt/'capture-config.json').exists():
  req('POST','/api/v1/auth/register',{'email':'demo-june@example.invalid','password':'FictionalDemo2026!'})
  _,login=req('POST','/api/v1/auth/login',{'email':'demo-june@example.invalid','password':'FictionalDemo2026!'})
  token=login['token']['access_token'];uid=login['id'];people=[]
  for name,rel,interests in [('Grandma Rose','Grandparent',['Gardening','Tea','Mysteries']),('Uncle Theo','Uncle',['Puzzles','Cooking']),('Aunt June','Aunt',['Painting','Hiking'])]:
   _,p=req('POST','/api/v1/persons',{'display_name':name,'relationship':rel,'interests':interests,'notes':'Fictional design demo only. Loves useful little things.'},token);people.append(p['id'])
  _,occ=req('POST','/api/v1/occasions',{'name':'Winter Gathering','type':'holiday','date':'2026-12-25','person_ids':people,'description':'An invented celebration for design review.'},token);oid=occ['id']
  req('POST',f'/api/v1/budgets/occasions/{oid}',{'budget_amount':300},token,False)
  _,li=req('POST','/api/v1/lists',{'name':'Gifts for Rose','type':'ideas','visibility':'family','person_id':people[0],'occasion_id':oid},token);lid=li['id'];gids=[]
  for name,price,pid,state in [('Garden Journal',28,people[0],'idea'),('Ceramic Tea Set',45,people[0],'selected'),('Wooden Puzzle',24,people[1],'purchased'),('Watercolor Set',36,people[2],'idea')]:
   _,g=req('POST','/api/v1/gifts',{'name':name,'price':price,'person_ids':[pid],'description':'Fictional demo gift, no retailer or personal data.','status':state},token);gids.append(g['id'])
   req('POST',f'/api/v1/lists/{lid}/items',{'gift_id':g['id'],'price':price,'quantity':1,'status':state,'assigned_to':uid if state!='idea' else None},token)
  (rt/'capture-config.json').write_text(json.dumps({'person':people[0],'occasion':oid,'gift':gids[0],'list':lid}))
 _,demo_login=req('POST','/api/v1/auth/login',{'email':'demo-june@example.invalid','password':'FictionalDemo2026!'})
 demo_token=demo_login['token']['access_token']
 req('POST','/api/v1/budgets/occasions/1',{'budget_amount':300},demo_token,False)
 req('PUT','/api/v1/list-items/2/assign',{'assigned_to_id':demo_login['id']},demo_token,False)
 req('PUT','/api/v1/list-items/3/assign',{'assigned_to_id':demo_login['id']},demo_token,False)
 req('GET','/api/v1/lists/1/items',token=demo_token)
 for path in ['/api/v1/persons','/api/v1/occasions','/api/v1/gifts','/api/v1/lists']:
  _,login=req('POST','/api/v1/auth/login',{'email':'demo-june@example.invalid','password':'FictionalDemo2026!'})
  req('GET',path,token=login['token']['access_token'])
 start('web',['node',rt/'web/node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','18330'],rt/'web')
 for i in range(180):
  try:
   with urllib.request.urlopen('http://127.0.0.1:18330/login',timeout=3) as r:
    if r.status==200:break
  except Exception:time.sleep(1)
 cap=subprocess.run(['timeout','900','node',str(rt/os.environ.get('MOCKUP_CAPTURE_SCRIPT','capture.cjs'))],cwd=root,env=env,capture_output=True,text=True)
 (rt/'capture.log').write_text(cap.stdout+cap.stderr);results['capture_exit']=cap.returncode
 if cap.returncode:raise RuntimeError('Capture failed; see runtime/capture.log')
except Exception as e:
 import traceback
 results['error']=str(e);traceback.print_exc()
finally:
 results['processes']=[]
 for n,p in reversed(procs):
  try:os.killpg(p.pid,signal.SIGTERM)
  except ProcessLookupError:pass
  try:p.wait(timeout=20)
  except subprocess.TimeoutExpired:os.killpg(p.pid,signal.SIGKILL);p.wait()
  results['processes'].append({'name':n,'pid':p.pid,'exit':p.returncode,'stopped':p.poll() is not None})
 for f in logs:f.close()
 save();print(json.dumps({k:v for k,v in results.items() if k!='api'},indent=2))
