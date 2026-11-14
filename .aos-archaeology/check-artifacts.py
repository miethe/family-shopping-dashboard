from pathlib import Path
import json,yaml,hashlib,re
out=Path('.aos-archaeology');tree=yaml.safe_load((out/'intents.yaml').read_text());ids=[]
def walk(x):
 if isinstance(x,dict):
  if 'intent' in x:
   ids.append(x['id']);assert x['historical'] is True and x['status'] in ['built','partial','ideated','abandoned'] and x['sources']
  if 'path' in x and 'line' in x:
   p=Path(x['path']);assert p.is_file() and 0<x['line']<=len(p.read_text().splitlines()),x
  for v in x.values():walk(v)
 elif isinstance(x,list):
  for v in x:walk(v)
walk(tree);assert len(ids)==len(set(ids))
checks=json.loads((out/'page-validation.json').read_text())
for c in checks:
 assert c['sourcesCollapsed'] and not c['overflow'] and all(i['loaded'] for i in c['images']), c['name']
 assert not re.search(r'\d|\.py|\.tsx|\.yaml|/Users/|services/|apps/',c['mainText']), 'raw count or source path in main text'
rows=json.loads((out/'read-inventory.json').read_text());assert all(hashlib.sha256(Path(r['path']).read_bytes()).hexdigest()==r['sha256'] for r in rows)
results={'historical_intents':len(ids),'unique_ids':len(set(ids)),'source_pointers_valid':True,'source_drift':[],'page_checks':'Desktop and mobile: no horizontal overflow; local images decode after enabling eager loading in the validation browser; source appendix initially collapsed; main text contains no raw numbers or paths.','visual_inspection':'Desktop: clear large title, right-hand verdict and room diagram; no overlap. Mobile: stacked title/verdict, legible room grid, no horizontal clipping. App screenshots inspected individually; missing icon fonts and login error documented in findings.json.','errors':[],'sha256':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [out/'page.html',out/'intents.yaml']}}
(out/'artifact-validation.json').write_text(json.dumps(results,indent=2));print(json.dumps(results,indent=2))
