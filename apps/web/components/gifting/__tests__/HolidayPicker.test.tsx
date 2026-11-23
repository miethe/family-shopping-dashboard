import {render,screen,fireEvent} from '@testing-library/react';
import {it,expect,vi} from 'vitest';
import {HolidayPicker,upcomingHolidays} from '../HolidayPicker';
const rows=[{id:1,name:'Christmas',next_date:'2026-12-25',days_until:32,is_major:true},{id:2,name:'Thanksgiving',next_date:'2026-11-26',days_until:3,is_major:true},{id:3,name:'Hanukkah',next_date:'2026-12-04',days_until:11,is_major:false}] as any;
it('sorts holidays soonest first without mutating API data',()=>{expect(upcomingHolidays(rows).map(h=>h.id)).toEqual([2,3,1]);expect(rows[0].id).toBe(1);});
it('marks major holidays, searches, and selects the full API record',()=>{const change=vi.fn();render(<HolidayPicker holidays={rows} value="" onChange={change}/>);expect(screen.getAllByText('★ Major')).toHaveLength(2);fireEvent.change(screen.getByLabelText('Find a holiday'),{target:{value:'Christmas'}});expect(screen.queryByText('Thanksgiving')).toBeNull();fireEvent.click(screen.getByRole('button',{name:/Christmas/}));expect(change).toHaveBeenCalledWith(rows[0]);});
