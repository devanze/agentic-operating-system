# React Coding Style

## Components: Functions Only, No Classes

```tsx
// BAD — class component
class Greeting extends React.Component {
    render() { return <h1>Hello, {this.props.name}</h1>; }
}

// GOOD — function component
function Greeting({ name }: { name: string }) {
    return <h1>Hello, {name}</h1>;
}
```

## One Component Per File

- Each file exports one primary component
- Helper sub-components may be co-located if small and tightly coupled
- Name the file after the component: `UserProfile.tsx` exports `UserProfile`

## Custom Hooks for Reusable Logic

```tsx
// BAD — logic duplicated across components
function UserProfile({ userId }: { userId: string }) {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { fetchUser(userId).then(setUser); }, [userId]);
    // ...
}

// GOOD — extracted to custom hook
function useUser(userId: string) {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => { fetchUser(userId).then(setUser); }, [userId]);
    return user;
}
```

## Props Typed with Interface/Type

```tsx
// GOOD — explicit props interface
interface ButtonProps {
    label: string;
    variant?: "primary" | "secondary";
    disabled?: boolean;
    onClick: () => void;
}

function Button({ label, variant = "primary", disabled, onClick }: ButtonProps) {
    return (
        <button className={`btn btn-${variant}`} disabled={disabled} onClick={onClick}>
            {label}
        </button>
    );
}
```

## useEffect Cleanup

```tsx
// GOOD — cleanup function prevents memory leaks
useEffect(() => {
    const subscription = eventBus.subscribe("update", handleUpdate);
    return () => subscription.unsubscribe();
}, []);
```

## useMemo / useCallback — Use When Needed

```tsx
// BAD — wrapping everything in useMemo
const sorted = useMemo(() => items.sort(), [items]);  // fine
const doubled = useMemo(() => x * 2, [x]);             // useless optimization

// GOOD — only for expensive computations
const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
);
```

## Prop Drilling Warning

```tsx
// BAD — drilling props through 4+ levels
function Page({ user, theme, locale, onLogout }) { ... }
function Header({ user, theme, locale, onLogout }) { ... }
function Avatar({ user, theme }) { ... }

// GOOD — context for shared concerns
const AuthContext = createContext<AuthContextType | null>(null);
function Avatar() {
    const auth = useContext(AuthContext)!;
    return <img src={auth.user.avatar} />;
}
```

## Data-testid for Test Selectors

```tsx
// GOOD — stable test target not affected by CSS or text changes
<button data-testid="submit-btn" onClick={handleSubmit}>Submit</button>
```

## Anti-Patterns

| Bad | Good | Reason |
|-----|------|--------|
| `{<Component/> && condition}` | `{condition && <Component/>}` | Boolean rendering can show 0 |
| `useState(computeExpensive())` | `useState(() => computeExpensive())` | Lazy init avoids re-computation |
| `useEffect(() => fetch(url), [])` | React Query / SWR | No caching, no deduplication |
| Inline arrow function in JSX | `useCallback` or extracted handler | Creates new function every render |
