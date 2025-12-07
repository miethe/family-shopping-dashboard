/**
 * ImagePicker Usage Examples
 *
 * This file demonstrates how to use the ImagePicker component
 * in different scenarios (Gift form, Person form, etc.)
 */

'use client';

import { useState } from 'react';
import { ImagePicker } from './image-picker';

/**
 * Example 1: Basic usage in a form
 */
export function BasicImagePickerExample() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  return (
    <form className="space-y-4">
      <ImagePicker
        value={imageUrl}
        onChange={setImageUrl}
        onError={(error) => console.error('Upload error:', error)}
      />

      <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded">
        Submit
      </button>
    </form>
  );
}

/**
 * Example 2: Gift creation form
 */
export function GiftFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image_url: null as string | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting gift:', formData);
    // Call gift API here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block mb-2 text-sm font-semibold">Gift Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold">Price</label>
        <input
          type="number"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold">Image</label>
        <ImagePicker
          value={formData.image_url}
          onChange={(url) => setFormData({ ...formData, image_url: url })}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
      >
        Create Gift
      </button>
    </form>
  );
}

/**
 * Example 3: With disabled state
 */
export function DisabledImagePickerExample() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <ImagePicker
      value={imageUrl}
      onChange={setImageUrl}
      disabled={isSubmitting}
    />
  );
}

/**
 * Example 4: With custom error handling
 */
export function CustomErrorHandlingExample() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div>
      <ImagePicker
        value={imageUrl}
        onChange={(url) => {
          setImageUrl(url);
          setErrorMessage(null); // Clear external error on success
        }}
        onError={(error) => {
          setErrorMessage(error);
          // Could also show a toast notification here
        }}
      />

      {errorMessage && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-700">External error: {errorMessage}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Pre-populated with existing image (Edit form)
 */
export function EditFormExample() {
  // Simulate loading existing gift data
  const [imageUrl, setImageUrl] = useState<string | null>(
    'https://example.com/existing-image.jpg'
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Edit Gift</h2>

      <ImagePicker
        value={imageUrl}
        onChange={setImageUrl}
        onError={(error) => console.error(error)}
      />

      <div className="flex gap-2">
        <button className="px-4 py-2 bg-primary-500 text-white rounded">
          Save Changes
        </button>
        <button className="px-4 py-2 bg-warm-200 text-warm-800 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
}
