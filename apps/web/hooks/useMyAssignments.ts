import { listApi, listItemApi, personApi } from '@/lib/api/endpoints';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import type { ListItemWithGift } from '@/types';

/**
 * Extended ListItem with list context for assignments view
 */
export interface AssignmentItem extends ListItemWithGift {
  list?: {
    id: number;
    name: string;
    person_id?: number;
    person_name?: string;
  };
}

export interface AssignmentFilterParams {
  status?: string;
}

/** Read existing list/item endpoints sequentially to bound resource use. */
export async function loadAssignments(userId:number,status?:string):Promise<AssignmentItem[]> {
  const result:AssignmentItem[]=[];let cursor:number|undefined;
  const names=new Map<number,string>();
  do {
    const page=await listApi.list({limit:100,cursor});
    for(const list of page.items) {
      const items=await listItemApi.list({list_id:list.id});
      const assigned=items.filter(item=>item.assigned_to===userId&&(!status||item.status===status));
      if(!assigned.length)continue;
      if(list.person_id&&!names.has(list.person_id))names.set(list.person_id,(await personApi.get(list.person_id)).display_name);
      result.push(...assigned.map(item=>({...item,list:{id:list.id,name:list.name,person_id:list.person_id,person_name:list.person_id?names.get(list.person_id):undefined}})));
    }
    cursor=page.has_more?page.next_cursor??undefined:undefined;
  } while(cursor!==undefined);
  return result;
}
export function useMyAssignments(params?:AssignmentFilterParams) {
 const {user}=useAuth();
 return useQuery({queryKey:['assignments','me',user?.id,params],queryFn:()=>loadAssignments(user!.id,params?.status),enabled:!!user?.id});
}

/**
 * Group assignments by list
 */
export function groupAssignmentsByList(assignments: AssignmentItem[]) {
  const grouped = new Map<number, { list: AssignmentItem['list']; items: AssignmentItem[] }>();

  assignments.forEach((assignment) => {
    if (!assignment.list) return;

    const listId = assignment.list.id;
    if (!grouped.has(listId)) {
      grouped.set(listId, {
        list: assignment.list,
        items: [],
      });
    }
    grouped.get(listId)!.items.push(assignment);
  });

  return Array.from(grouped.values());
}

/**
 * Group assignments by person
 */
export function groupAssignmentsByPerson(assignments: AssignmentItem[]) {
  const grouped = new Map<string, { personName: string; items: AssignmentItem[] }>();

  assignments.forEach((assignment) => {
    const personName = assignment.list?.person_name || 'Unknown';
    if (!grouped.has(personName)) {
      grouped.set(personName, {
        personName,
        items: [],
      });
    }
    grouped.get(personName)!.items.push(assignment);
  });

  return Array.from(grouped.values());
}
