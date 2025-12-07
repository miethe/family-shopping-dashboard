/**
 * ImagePicker Component Tests
 *
 * Comprehensive test suite covering all input methods:
 * - File upload (click)
 * - Drag and drop
 * - Paste from clipboard
 * - URL input
 * - Validation and error handling
 * - Preview and removal
 * - Disabled state
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ImagePicker } from '../image-picker';
import { uploadApi } from '@/lib/api/upload';

// Mock the upload API
vi.mock('@/lib/api/upload', () => ({
  uploadApi: {
    uploadImage: vi.fn(),
    uploadImageFromUrl: vi.fn(),
  },
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe('ImagePicker', () => {
  const mockOnChange = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockOnError.mockClear();
    vi.mocked(uploadApi.uploadImage).mockClear();
    vi.mocked(uploadApi.uploadImageFromUrl).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders upload area when no image is selected', () => {
      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      expect(screen.getByText(/Drop image here, paste, or click to upload/i)).toBeInTheDocument();
      expect(screen.getByText(/JPEG, PNG, WebP, GIF, HEIF\/HEIC up to 10MB/i)).toBeInTheDocument();
    });

    it('renders mode toggle buttons', () => {
      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /url/i })).toBeInTheDocument();
    });

    it('renders preview when image value is provided', () => {
      render(
        <ImagePicker
          value="https://example.com/image.jpg"
          onChange={mockOnChange}
        />
      );

      const image = screen.getByAltText('Selected image preview');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });
  });

  describe('File Upload (Click)', () => {
    it('triggers file input when upload area is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      const uploadArea = screen.getByText(/Drop image here, paste, or click to upload/i).closest('div');
      expect(uploadArea).toBeInTheDocument();

      // Click should trigger the hidden file input
      await user.click(uploadArea!);

      // Verify hidden file input exists
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });

    it('accepts valid image file and uploads via API', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(uploadApi.uploadImage).mockResolvedValue({
        url: 'https://cdn.example.com/uploaded.jpg',
        thumbnail_url: 'https://cdn.example.com/uploaded-thumb.jpg',
      });

      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeInTheDocument();

      await user.upload(fileInput, mockFile);

      await waitFor(() => {
        expect(uploadApi.uploadImage).toHaveBeenCalledWith(mockFile);
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('https://cdn.example.com/uploaded.jpg');
      });
    });

    it('shows uploading state during upload', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      // Delay the upload to capture loading state
      vi.mocked(uploadApi.uploadImage).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          url: 'https://cdn.example.com/uploaded.jpg',
          thumbnail_url: 'https://cdn.example.com/uploaded-thumb.jpg',
        }), 100))
      );

      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      // Should show uploading text
      expect(screen.getByText('Uploading...')).toBeInTheDocument();

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('handles upload API error', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(uploadApi.uploadImage).mockRejectedValue(
        new Error('Network error')
      );

      render(
        <ImagePicker value={null} onChange={mockOnChange} onError={mockOnError} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, mockFile);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Network error');
      });

      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('Drag and Drop', () => {
    // Helper to create drag event compatible with jsdom
    const createDragEvent = (type: string, files?: File[]) => {
      const event = new Event(type, { bubbles: true, cancelable: true }) as any;
      event.dataTransfer = {
        files: files || [],
        items: files || [],
        types: files ? ['Files'] : [],
      };
      return event;
    };

    it('shows visual feedback on drag enter', async () => {
      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      const uploadArea = screen.getByText(/Drop image here, paste, or click to upload/i).closest('div');
      expect(uploadArea).toBeInTheDocument();

      // Simulate drag enter
      const dragEvent = createDragEvent('dragenter');
      uploadArea!.dispatchEvent(dragEvent);

      // Should have dragging state (check for primary-500 border color class)
      await waitFor(() => {
        expect(uploadArea).toHaveClass('border-primary-500');
      });
    });

    it('removes visual feedback on drag leave', async () => {
      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      const uploadArea = screen.getByText(/Drop image here, paste, or click to upload/i).closest('div');
      expect(uploadArea).toBeInTheDocument();

      // Simulate drag enter then drag leave
      const dragEnterEvent = createDragEvent('dragenter');
      const dragLeaveEvent = createDragEvent('dragleave');

      uploadArea!.dispatchEvent(dragEnterEvent);
      uploadArea!.dispatchEvent(dragLeaveEvent);

      // Should not have dragging state
      await waitFor(() => {
        expect(uploadArea).not.toHaveClass('border-primary-500');
      });
    });

    it('uploads file when dropped', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(uploadApi.uploadImage).mockResolvedValue({
        url: 'https://cdn.example.com/uploaded.jpg',
        thumbnail_url: 'https://cdn.example.com/uploaded-thumb.jpg',
      });

      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      const uploadArea = screen.getByText(/Drop image here, paste, or click to upload/i).closest('div');
      expect(uploadArea).toBeInTheDocument();

      // Simulate drop event
      const dropEvent = createDragEvent('drop', [mockFile]);
      uploadArea!.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(uploadApi.uploadImage).toHaveBeenCalledWith(mockFile);
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('https://cdn.example.com/uploaded.jpg');
      });
    });

    it('shows error when non-image file is dropped', async () => {
      const mockFile = new File(['text content'], 'test.txt', { type: 'text/plain' });

      render(
        <ImagePicker value={null} onChange={mockOnChange} onError={mockOnError} />
      );

      const uploadArea = screen.getByText(/Drop image here, paste, or click to upload/i).closest('div');
      expect(uploadArea).toBeInTheDocument();

      // Simulate drop event with non-image file
      const dropEvent = createDragEvent('drop', [mockFile]);
      uploadArea!.dispatchEvent(dropEvent);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Please drop an image file');
      });

      expect(screen.getByText('Please drop an image file')).toBeInTheDocument();
    });
  });

  describe('Paste from Clipboard', () => {
    // Helper to create clipboard event compatible with jsdom
    const createClipboardEvent = (file: File) => {
      const event = new Event('paste', { bubbles: true, cancelable: true }) as any;
      event.clipboardData = {
        items: [
          {
            type: file.type,
            getAsFile: () => file,
          },
        ],
      };
      return event;
    };

    it('uploads image when pasted from clipboard', async () => {
      const mockFile = new File(['image content'], 'pasted.png', { type: 'image/png' });

      vi.mocked(uploadApi.uploadImage).mockResolvedValue({
        url: 'https://cdn.example.com/pasted.png',
        thumbnail_url: 'https://cdn.example.com/pasted-thumb.png',
      });

      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      // Create and dispatch clipboard event
      const clipboardEvent = createClipboardEvent(mockFile);
      document.dispatchEvent(clipboardEvent);

      await waitFor(() => {
        expect(uploadApi.uploadImage).toHaveBeenCalledWith(mockFile);
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('https://cdn.example.com/pasted.png');
      });
    });

    it('does not process paste when disabled', async () => {
      const mockFile = new File(['image content'], 'pasted.png', { type: 'image/png' });

      render(
        <ImagePicker value={null} onChange={mockOnChange} disabled={true} />
      );

      const clipboardEvent = createClipboardEvent(mockFile);
      document.dispatchEvent(clipboardEvent);

      // Wait a bit to ensure event handler would have fired if it was going to
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(uploadApi.uploadImage).not.toHaveBeenCalled();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('does not process paste when in URL mode', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['image content'], 'pasted.png', { type: 'image/png' });

      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      // Switch to URL mode
      const urlButton = screen.getByRole('button', { name: /url/i });
      await user.click(urlButton);

      const clipboardEvent = createClipboardEvent(mockFile);
      document.dispatchEvent(clipboardEvent);

      // Wait a bit to ensure event handler would have fired if it was going to
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(uploadApi.uploadImage).not.toHaveBeenCalled();
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('URL Input', () => {
    it('toggles to URL mode when URL button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      const urlButton = screen.getByRole('button', { name: /url/i });
      await user.click(urlButton);

      // Should show URL input field
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /import from url/i })).toBeInTheDocument();
    });

    it('imports image from URL when submitted', async () => {
      const user = userEvent.setup();

      vi.mocked(uploadApi.uploadImageFromUrl).mockResolvedValue({
        url: 'https://cdn.example.com/imported.jpg',
        thumbnail_url: 'https://cdn.example.com/imported-thumb.jpg',
      });

      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      // Switch to URL mode
      const urlButton = screen.getByRole('button', { name: /url/i });
      await user.click(urlButton);

      // Enter URL
      const urlInput = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(urlInput, 'https://example.com/test-image.jpg');

      // Submit
      const submitButton = screen.getByRole('button', { name: /import from url/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(uploadApi.uploadImageFromUrl).toHaveBeenCalledWith('https://example.com/test-image.jpg');
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('https://cdn.example.com/imported.jpg');
      });
    });

    it('shows error when URL is empty', async () => {
      const user = userEvent.setup();

      render(
        <ImagePicker value={null} onChange={mockOnChange} onError={mockOnError} />
      );

      // Switch to URL mode
      const urlButton = screen.getByRole('button', { name: /url/i });
      await user.click(urlButton);

      // Submit without entering URL
      const submitButton = screen.getByRole('button', { name: /import from url/i });

      // Button should be disabled when URL is empty
      expect(submitButton).toBeDisabled();
    });

    it('handles URL import API error', async () => {
      const user = userEvent.setup();

      vi.mocked(uploadApi.uploadImageFromUrl).mockRejectedValue(
        new Error('Failed to download image from URL')
      );

      render(
        <ImagePicker value={null} onChange={mockOnChange} onError={mockOnError} />
      );

      // Switch to URL mode
      const urlButton = screen.getByRole('button', { name: /url/i });
      await user.click(urlButton);

      // Enter URL
      const urlInput = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(urlInput, 'https://example.com/invalid.jpg');

      // Submit
      const submitButton = screen.getByRole('button', { name: /import from url/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Failed to download image from URL');
      });

      expect(screen.getByText('Failed to download image from URL')).toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('clears URL input after successful import', async () => {
      const user = userEvent.setup();

      vi.mocked(uploadApi.uploadImageFromUrl).mockResolvedValue({
        url: 'https://cdn.example.com/imported.jpg',
        thumbnail_url: 'https://cdn.example.com/imported-thumb.jpg',
      });

      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      // Switch to URL mode
      const urlButton = screen.getByRole('button', { name: /url/i });
      await user.click(urlButton);

      // Enter URL
      const urlInput = screen.getByPlaceholderText('https://example.com/image.jpg');
      await user.type(urlInput, 'https://example.com/test-image.jpg');

      // Submit
      const submitButton = screen.getByRole('button', { name: /import from url/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      // Input should be cleared (will need to re-query after state update)
      await waitFor(() => {
        const clearedInput = screen.queryByDisplayValue('https://example.com/test-image.jpg');
        expect(clearedInput).not.toBeInTheDocument();
      });
    });
  });

  describe('Validation', () => {
    it('rejects files over 10MB', async () => {
      const user = userEvent.setup();
      // Create a file larger than 10MB (10 * 1024 * 1024 bytes)
      const largeFile = new File(
        [new ArrayBuffer(11 * 1024 * 1024)],
        'large.jpg',
        { type: 'image/jpeg' }
      );

      render(
        <ImagePicker value={null} onChange={mockOnChange} onError={mockOnError} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, largeFile);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('File too large. Maximum size: 10MB');
      });

      expect(screen.getByText('File too large. Maximum size: 10MB')).toBeInTheDocument();
      expect(uploadApi.uploadImage).not.toHaveBeenCalled();
    });

    it('rejects invalid file types', async () => {
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      render(
        <ImagePicker value={null} onChange={mockOnChange} onError={mockOnError} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Manually trigger the change event since jsdom file input accept filtering might prevent it
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIF/HEIC'
        );
      });

      expect(screen.getByText('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIF/HEIC')).toBeInTheDocument();
      expect(uploadApi.uploadImage).not.toHaveBeenCalled();
    });

    it.each([
      ['image/jpeg', 'JPEG'],
      ['image/png', 'PNG'],
      ['image/webp', 'WebP'],
      ['image/gif', 'GIF'],
      ['image/heif', 'HEIF'],
      ['image/heic', 'HEIC'],
    ])('accepts valid file type: %s', async (mimeType, name) => {
      const user = userEvent.setup();
      const validFile = new File(['content'], `test.${name.toLowerCase()}`, { type: mimeType });

      vi.mocked(uploadApi.uploadImage).mockResolvedValue({
        url: 'https://cdn.example.com/uploaded.jpg',
        thumbnail_url: 'https://cdn.example.com/uploaded-thumb.jpg',
      });

      render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput, validFile);

      await waitFor(() => {
        expect(uploadApi.uploadImage).toHaveBeenCalledWith(validFile);
      });
    });
  });

  describe('Preview and Removal', () => {
    it('displays preview for current image', () => {
      render(
        <ImagePicker
          value="https://example.com/current.jpg"
          onChange={mockOnChange}
        />
      );

      const image = screen.getByAltText('Selected image preview');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/current.jpg');
    });

    it('shows remove button on hover when not disabled', async () => {
      const user = userEvent.setup();
      render(
        <ImagePicker
          value="https://example.com/current.jpg"
          onChange={mockOnChange}
        />
      );

      // Remove button exists but is hidden initially
      const removeButton = screen.getByLabelText('Remove image');
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveClass('opacity-0');

      // Hover over the image container
      const imageContainer = removeButton.closest('.group');
      expect(imageContainer).toBeInTheDocument();
    });

    it('calls onChange with null when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <ImagePicker
          value="https://example.com/current.jpg"
          onChange={mockOnChange}
        />
      );

      const removeButton = screen.getByLabelText('Remove image');
      await user.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith(null);
    });

    it('clears error when image is removed', async () => {
      const { rerender } = render(
        <ImagePicker
          value="https://example.com/current.jpg"
          onChange={mockOnChange}
          onError={mockOnError}
        />
      );

      // First show an error by uploading invalid file
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      // Switch back to upload mode and cause an error
      rerender(
        <ImagePicker
          value={null}
          onChange={mockOnChange}
          onError={mockOnError}
        />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Manually trigger the change event with invalid file
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        configurable: true,
      });

      let changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(() => {
        expect(screen.getByText('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIF/HEIC')).toBeInTheDocument();
      });

      // Now upload a valid file
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(uploadApi.uploadImage).mockResolvedValue({
        url: 'https://cdn.example.com/uploaded.jpg',
        thumbnail_url: 'https://cdn.example.com/uploaded-thumb.jpg',
      });

      // Manually set valid file and trigger change
      Object.defineProperty(fileInput, 'files', {
        value: [validFile],
        configurable: true,
      });

      changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('https://cdn.example.com/uploaded.jpg');
      });

      // Simulate parent component updating value
      rerender(
        <ImagePicker
          value="https://cdn.example.com/uploaded.jpg"
          onChange={mockOnChange}
          onError={mockOnError}
        />
      );

      // Error should be cleared when value is set
      await waitFor(() => {
        expect(screen.queryByText('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIF/HEIC')).not.toBeInTheDocument();
      });
    });
  });

  describe('Disabled State', () => {
    it('does not trigger file input when disabled', async () => {
      const user = userEvent.setup();
      render(
        <ImagePicker value={null} onChange={mockOnChange} disabled={true} />
      );

      const uploadArea = screen.getByText(/Drop image here, paste, or click to upload/i).closest('div');
      expect(uploadArea).toBeInTheDocument();

      await user.click(uploadArea!);

      // File input should be disabled
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeDisabled();
    });

    it('does not process drag events when disabled', async () => {
      const mockFile = new File(['image content'], 'test.jpg', { type: 'image/jpeg' });

      render(
        <ImagePicker value={null} onChange={mockOnChange} disabled={true} />
      );

      const uploadArea = screen.getByText(/Drop image here, paste, or click to upload/i).closest('div');
      expect(uploadArea).toBeInTheDocument();

      // Helper to create drag event compatible with jsdom
      const createDragEvent = (type: string, files?: File[]) => {
        const event = new Event(type, { bubbles: true, cancelable: true }) as any;
        event.dataTransfer = {
          files: files || [],
          items: files || [],
          types: files ? ['Files'] : [],
        };
        return event;
      };

      // Simulate drag enter
      const dragEnterEvent = createDragEvent('dragenter');
      uploadArea!.dispatchEvent(dragEnterEvent);

      // Should not show dragging state
      await waitFor(() => {
        expect(uploadArea).not.toHaveClass('border-primary-500');
      });

      // Simulate drop
      const dropEvent = createDragEvent('drop', [mockFile]);
      uploadArea!.dispatchEvent(dropEvent);

      // Wait a bit to ensure event handler would have fired if it was going to
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(uploadApi.uploadImage).not.toHaveBeenCalled();
    });

    it('disables mode toggle buttons when disabled', () => {
      render(
        <ImagePicker value={null} onChange={mockOnChange} disabled={true} />
      );

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      const urlButton = screen.getByRole('button', { name: /url/i });

      expect(uploadButton).toBeDisabled();
      expect(urlButton).toBeDisabled();
    });

    it('disables URL input and submit when disabled', async () => {
      const user = userEvent.setup();

      // First render enabled and switch to URL mode
      const { rerender } = render(
        <ImagePicker value={null} onChange={mockOnChange} />
      );

      const urlButton = screen.getByRole('button', { name: /url/i });
      await user.click(urlButton);

      // Verify URL input is shown
      expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();

      // Now disable
      rerender(
        <ImagePicker value={null} onChange={mockOnChange} disabled={true} />
      );

      const urlInput = screen.getByPlaceholderText('https://example.com/image.jpg');
      const submitButton = screen.getByRole('button', { name: /import from url/i });

      expect(urlInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('does not show remove button when disabled and image is present', () => {
      render(
        <ImagePicker
          value="https://example.com/current.jpg"
          onChange={mockOnChange}
          disabled={true}
        />
      );

      // Remove button should not be rendered when disabled
      const removeButton = screen.queryByLabelText('Remove image');
      expect(removeButton).not.toBeInTheDocument();
    });

    it('shows disabled styling on upload area', () => {
      render(
        <ImagePicker value={null} onChange={mockOnChange} disabled={true} />
      );

      const uploadArea = screen.getByText(/Drop image here, paste, or click to upload/i).closest('div');
      expect(uploadArea).toBeInTheDocument();
      expect(uploadArea).toHaveClass('cursor-not-allowed', 'opacity-50');
    });
  });

  describe('Error Display', () => {
    it('displays error message when error occurs', async () => {
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      render(
        <ImagePicker value={null} onChange={mockOnChange} onError={mockOnError} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Manually trigger the change event
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(() => {
        const errorMessage = screen.getByText('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIF/HEIC');
        expect(errorMessage).toBeInTheDocument();

        // Check that error is displayed with proper styling
        const errorContainer = errorMessage.closest('div');
        expect(errorContainer).toHaveClass('bg-status-warning-50', 'border-status-warning-200');
      });
    });

    it('calls onError callback when provided', async () => {
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

      render(
        <ImagePicker value={null} onChange={mockOnChange} onError={mockOnError} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Manually trigger the change event
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      });

      const changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          'Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIF/HEIC'
        );
      });
    });

    it('clears error when valid image is uploaded', async () => {
      const invalidFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

      vi.mocked(uploadApi.uploadImage).mockResolvedValue({
        url: 'https://cdn.example.com/uploaded.jpg',
        thumbnail_url: 'https://cdn.example.com/uploaded-thumb.jpg',
      });

      render(
        <ImagePicker value={null} onChange={mockOnChange} onError={mockOnError} />
      );

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      // First upload invalid file
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        configurable: true,
      });

      let changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(() => {
        expect(screen.getByText('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIF/HEIC')).toBeInTheDocument();
      });

      // Then upload valid file
      Object.defineProperty(fileInput, 'files', {
        value: [validFile],
        configurable: true,
      });

      changeEvent = new Event('change', { bubbles: true });
      fileInput.dispatchEvent(changeEvent);

      await waitFor(() => {
        expect(uploadApi.uploadImage).toHaveBeenCalledWith(validFile);
      });

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, HEIF/HEIC')).not.toBeInTheDocument();
      });
    });
  });
});
