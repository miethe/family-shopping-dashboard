'use client';

import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Spinner,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Avatar,
  AvatarImage,
  AvatarFallback,
  getInitials,
  Badge,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonCard,
} from '@/components/ui';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

/**
 * UI Component Showcase
 * Demonstrates all base UI components from FE-007
 */
export default function UIDemo() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <Toaster />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UI Component Library</h1>
          <p className="text-gray-600">FE-007: Base Components - Mobile-first, accessible UI components</p>
        </div>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>Various button variants with 44px touch targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Button>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button isLoading onClick={handleLoadingDemo}>
                Loading State
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </CardContent>
        </Card>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle>Input Fields</CardTitle>
            <CardDescription>Form inputs with labels, errors, and helper text</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input label="Email" type="email" placeholder="email@example.com" />
            <Input
              label="Password"
              type="password"
              required
              helperText="Must be at least 8 characters"
            />
            <Input
              label="Error State"
              error="This field is required"
              defaultValue="Invalid input"
            />
            <Input disabled label="Disabled" value="Cannot edit" />
          </CardContent>
        </Card>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Standard card with border</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">This is the default card variant.</p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Elevated Card</CardTitle>
              <CardDescription>Card with shadow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">This card has a shadow elevation.</p>
            </CardContent>
          </Card>

          <Card variant="interactive">
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>Hover to see effect</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">This card responds to hover.</p>
            </CardContent>
          </Card>
        </div>

        {/* Spinner */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Spinners</CardTitle>
            <CardDescription>Various sizes and colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <Spinner size="sm" />
              <Spinner size="default" />
              <Spinner size="lg" />
              <Spinner size="xl" />
              <Spinner color="gray" />
              <div className="bg-primary-600 p-4 rounded">
                <Spinner color="white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialog */}
        <Card>
          <CardHeader>
            <CardTitle>Dialog Modal</CardTitle>
            <CardDescription>Accessible modal dialogs with Radix UI</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button variant="destructive">Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Toasts */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Notifications</CardTitle>
            <CardDescription>Temporary notifications with variants</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={() => toast({ title: 'Default Toast', description: 'This is a default toast message.' })}>
              Default Toast
            </Button>
            <Button onClick={() => toast({ title: 'Success!', description: 'Your changes have been saved.', variant: 'success' })}>
              Success Toast
            </Button>
            <Button onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'error' })}>
              Error Toast
            </Button>
            <Button onClick={() => toast({ title: 'Warning', description: 'Please check your input.', variant: 'warning' })}>
              Warning Toast
            </Button>
            <Button onClick={() => toast({ title: 'Info', description: 'New feature available!', variant: 'info' })}>
              Info Toast
            </Button>
          </CardContent>
        </Card>

        {/* Avatars */}
        <Card>
          <CardHeader>
            <CardTitle>Avatars</CardTitle>
            <CardDescription>User avatars with fallbacks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar size="sm">
                <AvatarFallback>{getInitials('John Doe')}</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>{getInitials('Jane Smith')}</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>{getInitials('Bob Wilson')}</AvatarFallback>
              </Avatar>
              <Avatar size="xl">
                <AvatarFallback>{getInitials('Alice Johnson')}</AvatarFallback>
              </Avatar>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Status and tag badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="primary">Primary</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge size="sm">Small</Badge>
              <Badge size="default">Default</Badge>
              <Badge size="lg">Large</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Skeletons */}
        <Card>
          <CardHeader>
            <CardTitle>Loading Skeletons</CardTitle>
            <CardDescription>Placeholder UI while content loads</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Text Skeleton</h3>
              <SkeletonText />
              <SkeletonText className="w-4/5" />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Circle Skeleton</h3>
              <SkeletonCircle />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Card Skeleton</h3>
              <SkeletonCard />
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium">Custom Skeleton</h3>
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                All components are mobile-first with 44px minimum touch targets
              </p>
              <p className="text-xs text-gray-500">
                Built with Radix UI primitives, Tailwind CSS, and class-variance-authority
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
