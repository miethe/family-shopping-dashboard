# UI Component Library

Base UI components for the Family Gifting Dashboard. Mobile-first, accessible, built on Radix UI primitives.

## Quick Import

```tsx
import {
  Button,
  Input,
  Card,
  Dialog,
  toast,
  Avatar,
  Badge,
  Skeleton,
  Spinner,
} from '@/components/ui';
```

## Components

### Button
```tsx
<Button variant="default | destructive | outline | secondary | ghost | link"
        size="sm | default | lg | icon"
        isLoading={boolean}>
  Click Me
</Button>
```

### Input
```tsx
<Input label="Email"
       type="email"
       error="Error message"
       helperText="Helper text"
       required />
```

### Card
```tsx
<Card variant="default | elevated | interactive" padding="none | sm | default | lg">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Dialog
```tsx
<Dialog>
  <DialogTrigger asChild><Button>Open</Button></DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button>Action</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toast
```tsx
// Add <Toaster /> to layout once
toast({
  title: 'Success!',
  description: 'Message',
  variant: 'default | success | error | warning | info',
});
```

### Avatar
```tsx
<Avatar size="sm | default | lg | xl">
  <AvatarImage src="/avatar.jpg" />
  <AvatarFallback>{getInitials('John Doe')}</AvatarFallback>
</Avatar>
```

### Badge
```tsx
<Badge variant="default | success | warning | error | info | primary"
       size="sm | default | lg">
  Status
</Badge>
```

### Skeleton
```tsx
<Skeleton className="h-4 w-full" />
<SkeletonText />
<SkeletonCircle />
<SkeletonCard />
```

### Spinner
```tsx
<Spinner size="sm | default | lg | xl"
         color="primary | white | gray" />
```

## Mobile-First Features

- ✅ 44px minimum touch targets
- ✅ Safe area padding support
- ✅ Focus states for keyboard navigation
- ✅ ARIA attributes for accessibility
- ✅ Responsive breakpoints

## Accessibility

All components include:
- Proper ARIA labels
- Keyboard navigation
- Focus indicators
- Screen reader support
- Error announcements

## Demo

Visit `/ui-demo` to see all components in action.

## Stack

- **Radix UI** - Accessible primitives
- **Tailwind CSS** - Styling
- **CVA** - Variant management
- **TypeScript** - Full type safety
