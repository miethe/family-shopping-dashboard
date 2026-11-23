'use client';
import { useRouter } from 'next/navigation';
import { PersonCreator } from './PersonCreator';
export function PersonForm() { const router=useRouter(); return <PersonCreator isOpen onClose={()=>router.push('/people')}/>; }
