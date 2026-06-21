# React Patterns

## Compound Components

```tsx
// Parent manages state, children are composable
function Tabs({ children }: { children: ReactNode }) {
    const [active, setActive] = useState(0);
    return (
        <TabsContext.Provider value={{ active, setActive }}>
            {children}
        </TabsContext.Provider>
    );
}

Tabs.Tab = function Tab({ index, label }: { index: number; label: string }) {
    const { active, setActive } = useContext(TabsContext)!;
    return (
        <button className={active === index ? "active" : ""} onClick={() => setActive(index)}>
            {label}
        </button>
    );
};
```

## Render Props (Legacy — Prefer Hooks)

```tsx
// Render prop pattern (use hooks instead for new code)
function MouseTracker({ render }: { render: (pos: Position) => ReactNode }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
        const handler = (e: MouseEvent) => setPosition({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", handler);
        return () => window.removeEventListener("mousemove", handler);
    }, []);
    return render(position);
}
```

## HOC vs Hooks — Hooks Win

```tsx
// BAD — HOC pattern (wraps component, name collision risk)
function withAuth(Component: React.ComponentType<{ user: User }>) {
    return function Authenticated(props: any) {
        const user = useAuth();
        if (!user) return <Redirect to="/login" />;
        return <Component {...props} user={user} />;
    };
}

// GOOD — hook pattern (composable, no name collision)
function Dashboard() {
    const { user, isLoading } = useAuth();
    if (isLoading) return <Spinner />;
    if (!user) return <Redirect to="/login" />;
    return <DashboardContent user={user} />;
}
```

## State Machines with useReducer

```tsx
type State = "idle" | "loading" | "success" | "error";
type Action = { type: "FETCH" } | { type: "SUCCESS" } | { type: "ERROR"; error: string };

function fetchReducer(state: State, action: Action): State {
    switch (action.type) {
        case "FETCH":   return "loading";
        case "SUCCESS": return "success";
        case "ERROR":   return "error";
        default:        return state;
    }
}

function DataLoader() {
    const [state, dispatch] = useReducer(fetchReducer, "idle");
    // state is always one of the 4 valid values — impossible states eliminated
}
```

## Debounce Input Handlers

```tsx
function SearchInput() {
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300); // custom hook

    useEffect(() => {
        if (debouncedQuery) search(debouncedQuery);
    }, [debouncedQuery]);
}
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| Context for frequently updating state | Zustand or atom family | Context re-renders all consumers |
| `useEffect` for derived state | `useMemo` or computed | Derived state is synchronous |
| Single `useEffect` with multiple concerns | Separate `useEffect` per concern | Coupled cleanup and dependencies |
