'use client';

/**
 * Animation Examples
 *
 * This file demonstrates how to use the animation system throughout the app.
 * Copy these patterns into your components as needed.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function AnimationExamples() {
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-cream p-6 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page Transitions Example */}
        <section>
          <h2 className="text-heading-1 font-bold mb-4">Page Transitions</h2>
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle>This card slides up on mount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-medium text-warm-600">
                The entire page fades in with <code>animate-fade-in</code> and this card
                slides up with <code>animate-slide-up</code>.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Interactive Cards Example */}
        <section>
          <h2 className="text-heading-1 font-bold mb-4">Interactive Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="lift-effect cursor-pointer">
              <CardHeader>
                <CardTitle>Hover me!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-medium text-warm-600">
                  This card lifts up on hover with <code>lift-effect</code>.
                </p>
              </CardContent>
            </Card>

            <Card className="transition-slow hover:shadow-high">
              <CardHeader>
                <CardTitle>Custom transition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-medium text-warm-600">
                  This uses <code>transition-slow</code> for a smooth shadow change.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Button Effects Example */}
        <section>
          <h2 className="text-heading-1 font-bold mb-4">Button Effects</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="press-effect">
              Press Effect Button
            </Button>

            <Button className="ripple-effect">
              Ripple Effect Button
            </Button>

            <Button
              className="success-bounce"
              onClick={() => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 500);
              }}
            >
              Success Bounce
            </Button>

            {showSuccess && (
              <span className="text-green-600 animate-fade-in-fast">
                Saved!
              </span>
            )}
          </div>
        </section>

        {/* Staggered List Example */}
        <section>
          <h2 className="text-heading-1 font-bold mb-4">Staggered Animations</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item, index) => (
              <Card
                key={item}
                className={`animate-stagger stagger-delay-${index + 1}`}
              >
                <CardContent className="p-4">
                  <p>List item {item} - Animates with {index * 50}ms delay</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Loading States Example */}
        <section>
          <h2 className="text-heading-1 font-bold mb-4">Loading States</h2>
          <div className="space-y-4">
            {/* Shimmer loading */}
            <div className="shimmer h-20 rounded-xlarge" />

            {/* Skeleton with pulse */}
            <div className="space-y-2">
              <div className="animate-pulse bg-warm-200 h-4 w-3/4 rounded" />
              <div className="animate-pulse bg-warm-200 h-4 w-1/2 rounded" />
            </div>

            {/* Spinning loader */}
            <div className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full" />
              <span>Loading...</span>
            </div>
          </div>
        </section>

        {/* Modal Animation Example */}
        <section>
          <h2 className="text-heading-1 font-bold mb-4">Modal Animations</h2>
          <Button onClick={() => setShowModal(true)}>
            Show Modal
          </Button>

          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 animate-modal-backdrop"
                onClick={() => setShowModal(false)}
              />

              {/* Modal content */}
              <Card className="relative z-10 w-full max-w-md animate-scale-in">
                <CardHeader>
                  <CardTitle>Modal Title</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    This modal scales in smoothly with <code>animate-scale-in</code>.
                  </p>
                  <Button
                    onClick={() => setShowModal(false)}
                    className="press-effect"
                  >
                    Close
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </section>

        {/* Status & Feedback Example */}
        <section>
          <h2 className="text-heading-1 font-bold mb-4">Status & Feedback</h2>
          <div className="space-y-4">
            <Card className="attention-pulse border-primary-500">
              <CardContent className="p-4">
                <p>This card pulses to draw attention</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="status-flash">
                  Status changed! (Click to see flash)
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Performance Optimized Example */}
        <section>
          <h2 className="text-heading-1 font-bold mb-4">Performance Optimization</h2>
          <Card>
            <CardContent className="p-4 space-y-2">
              <p className="gpu-accelerated">
                This element is GPU accelerated for smooth animations.
              </p>
              <p className="will-change-transform hover:scale-105 transition-base">
                This hints it will transform (hover to see).
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Direction Animations Example */}
        <section>
          <h2 className="text-heading-1 font-bold mb-4">Directional Animations</h2>
          <div className="grid grid-cols-2 gap-4">
            <Card className="animate-slide-in-left">
              <CardContent className="p-4">
                <p>Slides from left</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-in-right">
              <CardContent className="p-4">
                <p>Slides from right</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-up">
              <CardContent className="p-4">
                <p>Slides from bottom</p>
              </CardContent>
            </Card>

            <Card className="animate-slide-down">
              <CardContent className="p-4">
                <p>Slides from top</p>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
}

/**
 * Usage Patterns Summary
 *
 * 1. PAGE TRANSITIONS
 *    - Add `animate-fade-in` to page wrapper
 *
 * 2. CARDS
 *    - Add `animate-slide-up` for entrance
 *    - Add `lift-effect` for hover interaction
 *
 * 3. BUTTONS
 *    - Add `press-effect` for standard buttons
 *    - Add `ripple-effect` for material design style
 *
 * 4. MODALS
 *    - Add `animate-modal-backdrop` to backdrop
 *    - Add `animate-scale-in` to modal content
 *
 * 5. LISTS
 *    - Add `animate-stagger` and `stagger-delay-X` to items
 *
 * 6. LOADING
 *    - Use `shimmer` for skeleton screens
 *    - Use `animate-pulse` for placeholders
 *    - Use `animate-spin` for spinners
 *
 * 7. STATUS
 *    - Use `attention-pulse` for notifications
 *    - Use `success-bounce` for success feedback
 *    - Use `status-flash` for state changes
 */
