from pathlib import Path
import shutil,json
root=Path.cwd();out=root/'.aos-mockups';prior=Path('/Volumes/SKNVME/aos-exec/dayhub1114-famarch/.clones/leg__RKCE1T1N-20261114T190619Z-82393/dayhub1114-famarch')
runtime=out/'runtime'; web=runtime/'web';web.mkdir(exist_ok=True)
for p in (root/'apps/web').iterdir():
 if p.name in ['node_modules','.next','.env','.env.local']:continue
 t=web/p.name
 if t.exists():continue
 if p.is_dir():shutil.copytree(p,t)
 else:shutil.copy2(p,t)
(web/'node_modules').symlink_to(prior/'apps/web/node_modules',target_is_directory=True)
(runtime/'python').symlink_to(prior/'services/api/.venv',target_is_directory=True)
(runtime/'pg-bin').symlink_to(prior/'.aos-archaeology/pg-runtime/node_modules/@embedded-postgres/darwin-arm64/native/bin',target_is_directory=True)
# API is loaded read-only via PYTHONPATH; no source copy/edit needed.
rows=[]
for p in sorted((root/'apps/web/app').rglob('page.tsx')):
 s=p.read_text();route='/'+str(p.relative_to(root/'apps/web/app').parent).replace('(auth)/','').replace('.','')
 rows.append({'route':route,'source':str(p.relative_to(root)),'headings':[l.strip() for l in s.splitlines() if '<h1' in l or '<h2' in l or 'title=' in l][:12],'kind':'diagnostic' if '/test-' in route or '/ui-demo' in route else 'product'})
(out/'screen-inventory.json').write_text(json.dumps(rows,indent=2))
print('Copied web source into permitted scratch; indexed',len(rows),'routes')
