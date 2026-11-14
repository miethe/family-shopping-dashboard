'use client';

import * as React from 'react';
import Image from 'next/image';
import { Card, Avatar, AvatarImage, AvatarFallback, getInitials, Check, Button } from '@/components/ui';
import { StatusSelector } from '@/components/ui/status-selector';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PersonDropdown } from '@/components/common/PersonDropdown';
import { GiftIcon } from '@/components/layout/icons';
import { ExternalLink, UserPlus, MoreVertical } from '@/components/ui/icons';
import { GiftTitleLink } from '@/components/common/GiftTitleLink';
import { formatPrice, cn } from '@/lib/utils';
import { useUpdateGift, useAttachPeopleToGift } from '@/hooks/useGifts';
import { useToast } from '@/components/ui/use-toast';
import type { Gift } from '@/types';
import { StatusPill, type GiftStatus } from '@/components/ui/status-pill';
import { LinkedEntityIcons, type LinkedPerson, type LinkedList } from './LinkedEntityIcons';
import { QuickPurchaseButton, type ListItemInfo } from './QuickPurchaseButton';
import { GiftQuickPurchaseButton } from './GiftQuickPurchaseButton';
import { StatusButton } from './StatusButton';
import { ListPickerDropdown } from './ListPickerDropdown';
import { PriceEditDialog } from './PriceEditDialog';

export interface GiftCardProps {
  gift: Gift & {
    status?: GiftStatus;
    assignee?: {
      name: string;
      avatarUrl?: string;
    };
    // NEW: Add these for the new components
    recipients?: LinkedPerson[];  // For LinkedEntityIcons
    lists?: LinkedList[];         // For LinkedEntityIcons
    list_items?: ListItemInfo[];  // For QuickPurchaseButton (from API)
  };
  onOpenDetail?: (giftId: string) => void;
  /** Whether bulk selection mode is active */
  selectionMode?: boolean;
  /** Whether this gift is currently selected */
  isSelected?: boolean;
  /** Callback when selection checkbox is toggled */
  onToggleSelection?: () => void;
  /** NEW: Callback when status chip is clicked */
  onStatusFilter?: (status: GiftStatus) => void;
  /** NEW: Callback when recipient icon is clicked */
  onRecipientClick?: (personId: number) => void;
  /** NEW: Callback when list icon is clicked */
  onListClick?: (listId: number) => void;
}

/**
 * Gift Card Component
 *
 * Displays a gift with image, title, status, price, and assignee.
 * Mobile-optimized with Soft Modernity design system.
 * Uses Card with interactive variant for hover effects.
 * Includes interactive status selector that stops propagation to prevent modal opening.
 * Supports bulk selection mode with checkbox overlay.
 * Modal state is managed by parent page to prevent multiple instances triggering API calls.
 */
export function GiftCard({
  gift,
  onOpenDetail,
  selectionMode = false,
  isSelected = false,
  onToggleSelection,
  onStatusFilter,
  onRecipientClick,
  onListClick,
}: GiftCardProps) {
  const updateGiftMutation = useUpdateGift(gift.id);
  const attachPeopleMutation = useAttachPeopleToGift(gift.id);
  const { toast } = useToast();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = React.useState(false);
  const [isPriceDialogOpen, setIsPriceDialogOpen] = React.useState(false);
  const mobileMenuRef = React.useRef<HTMLDivElement>(null);

  const handleStatusChange = (newStatus: GiftStatus) => {
    // Optimistically update the status with toast feedback
    updateGiftMutation.mutate(
      { status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: 'Status updated',
            description: `Status changed to ${newStatus}`,
            variant: 'success',
          });
        },
        onError: (error: Error) => {
          toast({
            title: 'Failed to update status',
            description: error.message || 'An error occurred',
            variant: 'error',
          });
        },
      }
    );
  };

  const handleRecipientChange = (personId: number | number[] | null) => {
    if (typeof personId === 'number') {
      // Attach the selected person
      attachPeopleMutation.mutate([personId]);
      setShowRecipientPicker(false);
    }
  };

  const handleOpenUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gift.url) {
      window.open(gift.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRecipientClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowRecipientPicker(!showRecipientPicker);
  };

  const handleMobileMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMobileMenu(!showMobileMenu);
  };

  // Close mobile menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMobileMenu]);

  const handleCardClick = () => {
    if (selectionMode && onToggleSelection) {
      // In selection mode, clicking the card toggles selection
      onToggleSelection();
    } else if (!selectionMode && onOpenDetail) {
      // In normal mode, clicking opens detail modal
      onOpenDetail(String(gift.id));
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent card click
    e.stopPropagation();
    onToggleSelection?.();
  };

  const handleToggleSanta = async () => {
    try {
      await updateGiftMutation.mutateAsync({
        from_santa: !gift.from_santa,
      });
      toast({
        description: gift.from_santa ? 'Unmarked as from Santa' : 'Marked as from Santa',
      });
    } catch {
      toast({
        variant: 'error',
        description: 'Failed to update gift',
      });
    }
  };

  return (
    <TooltipProvider>
      <button
        onClick={handleCardClick}
        className="w-full text-left relative h-full"
      >
        <Card variant="interactive" padding="none" className="h-full">
          <div className="p-4 h-full flex flex-col">
            {/* Selection Checkbox - Overlays the card in top-left */}
            {selectionMode && (
              <div
                className="absolute top-3 left-3 z-10"
                onClick={handleCheckboxClick}
              >
                <div
                  className={`
                    w-6 h-6 rounded-md border-2 flex items-center justify-center
                    transition-all duration-200 ease-out cursor-pointer
                    ${
                      isSelected
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-white border-border-medium hover:border-primary-400'
                    }
                  `}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-white stroke-[3]" />
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions - Top Right (Both Mobile & Desktop) */}
            {!selectionMode && gift.url && (
              <div className="absolute top-3 right-3 z-10">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={handleOpenUrl}
                      className={cn(
                        'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-medium',
                        'bg-white/90 backdrop-blur-sm border border-warm-200',
                        'hover:bg-warm-50 hover:border-warm-300',
                        'transition-all duration-150 ease-out',
                        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1'
                      )}
                      aria-label="Open link"
                    >
                      <ExternalLink className="w-4 h-4 text-warm-700" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Open link</TooltipContent>
                </Tooltip>
              </div>
            )}

            {/* Mobile Overflow Menu Button - Top Right */}
            {!selectionMode && (
              <div className="absolute top-3 right-3 z-10 md:hidden" ref={mobileMenuRef}>
                <button
                  onClick={handleMobileMenuToggle}
                  className={cn(
                    'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-medium',
                    'bg-white/90 backdrop-blur-sm border border-warm-200',
                    'hover:bg-warm-50 hover:border-warm-300',
                    'transition-all duration-150 ease-out',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1'
                  )}
                  aria-label="More actions"
                  aria-expanded={showMobileMenu}
                >
                  <MoreVertical className="w-4 h-4 text-warm-700" />
                </button>

                {/* Mobile Menu Dropdown */}
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-large border border-warm-200 shadow-diffused py-2 z-50">
                    {gift.url && (
                      <button
                        onClick={handleOpenUrl}
                        className="w-full px-4 py-3 flex items-center gap-3 text-sm text-warm-900 hover:bg-warm-100 transition-colors min-h-[44px]"
                      >
                        <ExternalLink className="w-4 h-4 text-warm-600" />
                        <span>Open URL</span>
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        handleRecipientClick(e);
                        setShowMobileMenu(false);
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm text-warm-900 hover:bg-warm-100 transition-colors min-h-[44px]"
                    >
                      <UserPlus className="w-4 h-4 text-warm-600" />
                      <span>Assign Recipient</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSanta();
                        setShowMobileMenu(false);
                      }}
                      disabled={updateGiftMutation.isPending}
                      className="w-full px-4 py-3 flex items-center gap-3 text-sm text-warm-900 hover:bg-warm-100 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={gift.from_santa ? 'Unmark as from Santa' : 'Mark as from Santa'}
                    >
                      <span className="text-base" role="img" aria-hidden="true">🎅</span>
                      <span>{gift.from_santa ? 'Unmark as from Santa' : 'Mark as from Santa'}</span>
                    </button>
                    <div className="px-4 py-2 border-t border-warm-200">
                      <div className="text-xs font-semibold text-warm-600 mb-2">Change Status</div>
                      {gift.status && (
                        <StatusSelector
                          status={gift.status}
                          onChange={(newStatus) => {
                            handleStatusChange(newStatus);
                            setShowMobileMenu(false);
                          }}
                          size="sm"
                          disabled={updateGiftMutation.isPending}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Image */}
            <div className="aspect-square rounded-large overflow-hidden bg-warm-100 mb-3 relative">
              {gift.image_url ? (
                <Image
                  src={gift.image_url}
                  alt={gift.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <GiftIcon className="w-10 h-10 text-warm-300" />
                </div>
              )}

              {/* From Santa Icon */}
              {gift.from_santa && (
                <div
                  className="absolute top-2 right-2 text-2xl z-10 bg-white/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center shadow-soft"
                  title="From Santa"
                  role="img"
                  aria-label="This gift is from Santa"
                >
                  🎅
                </div>
              )}
            </div>

            {/* Content Area - grows to fill space */}
            <div className="flex-grow min-h-0 overflow-hidden">
              {/* Title */}
              <h3 className="text-base font-semibold text-warm-900 line-clamp-2 mb-2">
                <GiftTitleLink name={gift.name} url={gift.url} />
              </h3>

              {/* Status Badge - Always visible for quick status identification */}
              {gift.status && (
                <div className="mb-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusFilter?.(gift.status!);
                        }}
                        className="cursor-pointer hover:ring-2 hover:ring-primary-300 rounded-medium transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
                        aria-label={`Filter by status: ${gift.status}`}
                        type="button"
                      >
                        <StatusPill status={gift.status} size="sm" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Click to filter by {gift.status}</TooltipContent>
                  </Tooltip>
                </div>
              )}

              {/* NEW: Linked Entities - after title, before footer */}
              {(gift.recipients?.length || gift.lists?.length) ? (
                <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                  <LinkedEntityIcons
                    recipients={gift.recipients || []}
                    lists={gift.lists || []}
                    maxVisible={3}
                    onRecipientClick={onRecipientClick}
                    onListClick={onListClick}
                    size="sm"
                  />
                </div>
              ) : null}
            </div>

            {/* Footer: Price + Quick Purchase */}
            <div className="flex items-center justify-between mt-3">
              {/* Price - left side - clickable to edit */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPriceDialogOpen(true);
                }}
                className="flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity min-h-[44px]"
                aria-label={`Edit price: ${gift.price ? `$${formatPrice(gift.price)}` : 'Not set'}`}
              >
                {gift.price !== null && gift.price !== undefined ? (
                  <span className="text-sm font-semibold text-primary-600">
                    ${formatPrice(gift.price)}
                  </span>
                ) : (
                  <span className="text-sm text-warm-400">No price</span>
                )}
              </button>

              {/* Quick Purchase Button - right side - shows for all unpurchased gifts */}
              {gift.status !== 'purchased' && (
                <div onClick={(e) => e.stopPropagation()}>
                  <GiftQuickPurchaseButton
                    giftId={gift.id}
                    currentStatus={gift.status}
                    onPurchase={() => handleStatusChange('purchased')}
                    isPending={updateGiftMutation.isPending}
                  />
                </div>
              )}
            </div>

            {/* Desktop Quick Actions Bar - Bottom */}
            {!selectionMode && (
              <div className="hidden md:flex items-center gap-2 mt-auto pt-3 border-t border-warm-200">
                {/* Assign Recipient Button */}
                <div className="relative flex-shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleRecipientClick}
                        className={cn(
                          'flex items-center justify-center px-2.5 py-1.5 rounded-medium',
                          'border border-warm-200 bg-warm-50',
                          'hover:bg-warm-100 hover:border-warm-300',
                          'transition-all duration-150 ease-out',
                          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
                          'text-warm-700',
                          'min-h-[44px]'
                        )}
                        aria-label="Assign recipient"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Assign recipient</TooltipContent>
                  </Tooltip>

                  {/* Recipient Picker Dropdown */}
                  {showRecipientPicker && (
                    <div
                      className="absolute bottom-full mb-2 left-0 z-50 bg-white rounded-large border border-warm-200 shadow-diffused p-3 min-w-[280px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <PersonDropdown
                        value={gift.person_ids?.[0] || null}
                        onChange={handleRecipientChange}
                        variant="compact"
                        placeholder="Select recipient..."
                        allowNew={false}
                      />
                    </div>
                  )}
                </div>

                {/* Status Button */}
                <div onClick={(e) => e.stopPropagation()}>
                  <StatusButton
                    giftId={gift.id}
                    currentStatus={gift.status || 'idea'}
                    onStatusChange={handleStatusChange}
                  />
                </div>

                {/* List Picker Dropdown */}
                <div onClick={(e) => e.stopPropagation()}>
                  <ListPickerDropdown
                    giftId={gift.id}
                    currentListIds={gift.list_items?.map(li => li.list_id) || []}
                  />
                </div>

                {/* From Santa Toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSanta();
                      }}
                      disabled={updateGiftMutation.isPending}
                      className={cn(
                        'min-h-[44px] min-w-[44px] px-2.5',
                        gift.from_santa
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                      )}
                      aria-label={gift.from_santa ? 'Unmark as from Santa' : 'Mark as from Santa'}
                    >
                      🎅
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {gift.from_santa ? 'Unmark as from Santa' : 'Mark as from Santa'}
                  </TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        </Card>

        {/* Price Edit Dialog */}
        <PriceEditDialog
          open={isPriceDialogOpen}
          onOpenChange={setIsPriceDialogOpen}
          giftId={gift.id}
          currentPrice={gift.price ?? null}
        />
      </button>
    </TooltipProvider>
  );
}
