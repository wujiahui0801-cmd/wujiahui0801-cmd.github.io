from pathlib import Path, PurePosixPath
import hashlib, json, tarfile

repo = Path.cwd().resolve()
release = repo / 'release'
manifest = json.loads((release / 'manifest.json').read_text(encoding='utf-8'))
out = repo / '_site'
out.mkdir(exist_ok=True)
with tarfile.open(release / 'update.tar.gz', 'r:gz') as archive:
    updates = {m.name: m for m in archive.getmembers()}
    for entry in manifest['files']:
        rel = PurePosixPath(entry['path'])
        if rel.is_absolute() or '..' in rel.parts:
            raise ValueError('Unsafe release path')
        if str(rel) == '.nojekyll' and entry['size'] == 0:
            data = b''
        elif str(rel) in updates:
            member = updates[str(rel)]
            if not member.isfile():
                raise ValueError('Release entries must be regular files')
            data = archive.extractfile(member).read()
        else:
            data = (repo / str(rel)).read_bytes()
        if len(data) != entry['size'] or hashlib.sha256(data).hexdigest() != entry['sha256']:
            raise ValueError('Release verification failed: ' + str(rel))
        dest = out / str(rel)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
print('Verified release', manifest['release'], ':', len(manifest['files']), 'public files')
