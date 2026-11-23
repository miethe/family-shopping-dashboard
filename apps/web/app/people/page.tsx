 'use client';
import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { personApi } from '@/lib/api/endpoints';
import { useGroups, useCreateGroup } from '@/hooks/useGroups';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddPersonModal } from '@/components/people/AddPersonModal';
import { PersonCard } from '@/components/people/PersonCard';
import type { Group } from '@/types';
type CreateGroupButtonProps = {
  onCreated?: (group: Group) => void;
};

function CreateGroupButton({ onCreated }: CreateGroupButtonProps) {
  const [error,setError] = useState('');
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupColor, setGroupColor] = useState('#6366F1');
  const createGroup = useCreateGroup();

  const handleReset = () => {
    setGroupName('');
    setGroupColor('#6366F1');
    setIsAddingGroup(false);
  };

  const handleCreate = async () => {
    const name = groupName.trim();
    if (!name) return;

    try {
      const newGroup = await createGroup.mutateAsync({
        name,
        color: groupColor,
      });
      onCreated?.(newGroup);
      handleReset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Couldn’t create group. Try again.');
    }
  };

  if (!isAddingGroup) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsAddingGroup(true)}
        className="min-h-[44px]"
      >
        Create Group
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {error && <p role="alert">{error}</p>}
      <Input
        aria-label="Group name"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="w-40"
      />
      <input
        type="color"
        aria-label="Group color"
        value={groupColor}
        onChange={(e) => setGroupColor(e.target.value)}
        className="h-11 w-12 rounded-md border border-slate-200"
      />
      <Button
        size="sm"
        onClick={handleCreate}
        isLoading={createGroup.isPending}
        disabled={!groupName.trim() || createGroup.isPending}
        className="min-h-[44px]"
      >
        Save
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleReset}
        className="min-h-[44px]"
      >
        Cancel
      </Button>
    </div>
  );
}


export default function RecipientsPage() {
  const [search,setSearch]=useState(''); const [group,setGroup]=useState<number|null>(null); const [adding,setAdding]=useState(false);
  const query=useInfiniteQuery({queryKey:['persons','directory'],initialPageParam:undefined as number|undefined,queryFn:({pageParam})=>personApi.list({limit:100,cursor:pageParam}),getNextPageParam:page=>page.has_more?page.next_cursor??undefined:undefined}); const groups=useGroups();
  const people=query.data?.pages.flatMap(p=>p.items) || [];
  const visible=people.filter(p=>(group===null||p.groups?.some(g=>g.id===group))&&[p.display_name,p.relationship,...(p.interests||[])].some(s=>s?.toLowerCase().includes(search.toLowerCase())));
  return <div className="club-people"><header className="club-page-heading"><div><h1>Your people</h1><p>{people.length ? `${people.length} reasons to get a little excited.` : 'Good gifts start with your favourite people.'}</p></div><Button onClick={()=>setAdding(true)}>+ Add a person</Button></header>
    <Input aria-label="Find someone" placeholder="Find someone…" value={search} onChange={e=>setSearch(e.target.value)}/>
    <div className="club-filter-row"><div className="club-chips"><button aria-pressed={group===null} onClick={()=>setGroup(null)}>Everyone · {people.length}</button>{groups.data?.items.map(g=><button key={g.id} aria-pressed={group===g.id} onClick={()=>setGroup(g.id)}>{g.name} · {people.filter(p=>p.groups?.some(x=>x.id===g.id)).length}</button>)}</div><CreateGroupButton onCreated={g=>setGroup(g.id)}/></div>
    {query.isLoading?<p role="status" className="club-empty">Finding your people…</p>:query.error?<div role="alert" className="club-empty">Couldn’t load your people. <Button onClick={()=>query.refetch()}>Try again</Button></div>:visible.length?<div className="club-person-grid">{visible.map(p=><PersonCard key={p.id} person={p}/>)}</div>:<div className="club-empty"><span aria-hidden="true">♡</span><h2>{search||group!==null?'No one matches yet.':'A new favourite person?'}</h2><p>{search||group!==null?'Try another name or group.':'Start with a name. The little details can come later.'}</p><Button onClick={()=>setAdding(true)}>Add a person</Button></div>}
    {query.hasNextPage&&<Button className="mt-4" onClick={()=>query.fetchNextPage()} disabled={query.isFetchingNextPage}>Load more people</Button>}
    <AddPersonModal isOpen={adding} onClose={()=>setAdding(false)}/>
  </div>;
}
