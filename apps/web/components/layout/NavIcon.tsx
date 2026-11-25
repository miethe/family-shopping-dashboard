const paths: Record<string, string> = {
  home: 'M3 10 12 3l9 7v10H3Z M9 20v-7h6v7',
  calendar: 'M3 5h18v16H3Z M7 2v6 M17 2v6 M3 11h18 M7 15h2 M14 15h2',
  people: 'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M17 4a4 4 0 0 1 0 8 M19 15a4 4 0 0 1 3 4v2',
  gift: 'M3 9h18v4H3z M5 13v8h14v-8 M12 9v12 M12 9C1 9 5 0 9 4l3 5c11 0 7-9 3-5Z',
  idea: 'M8 17h8 M9 21h6 M8 14a7 7 0 1 1 8 0v3H8Z',
  list: 'M8 5h13 M8 12h13 M8 19h13 M3 5h1 M3 12h1 M3 19h1',
  budget: 'M3 6h18v14H3Z M3 9h18 M15 13h3',
  admin: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
  more: 'M4 12h.1 M12 12h.1 M20 12h.1',
};
export function NavIcon({ name }: { name: string }) {
  return <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true"><path d={paths[name] || paths.gift} /></svg>;
}
