import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function UploadPage() {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const videoPreviewRef = useRef(null);

    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [hashtags, setHashtags] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [step, setStep] = useState(1); // 1: select, 2: details, 3: processing

    const categories = [
        { id: 'tech', name: 'Tech', icon: '💻' },
        { id: 'science', name: 'Science', icon: '🔬' },
        { id: 'education', name: 'Education', icon: '📚' },
        { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
        { id: 'lifestyle', name: 'Lifestyle', icon: '🌟' },
        { id: 'health', name: 'Health', icon: '💪' },
        { id: 'business', name: 'Business', icon: '💼' },
        { id: 'other', name: 'Other', icon: '📌' },
    ];

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Validate file type
        if (!selectedFile.type.startsWith('video/')) {
            setError('Please select a video file');
            return;
        }

        // Validate file size (max 10GB)
        if (selectedFile.size > 10 * 1024 * 1024 * 1024) {
            setError('File size must be less than 10GB');
            return;
        }

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setError(null);
        setStep(2);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect({ target: { files: [droppedFile] } });
        }
    };

    const handleUpload = async () => {
        if (!file || !title.trim()) {
            setError('Please provide a title for your video');
            return;
        }

        setIsUploading(true);
        setStep(3);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('video', file);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('category', category);
            formData.append('hashtags', hashtags);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + Math.random() * 15;
                });
            }, 500);

            // In a real app, this would be an actual API call
            await new Promise((resolve) => setTimeout(resolve, 3000));

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Redirect to home after successful upload
            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (err) {
            setError('Upload failed. Please try again.');
            setIsUploading(false);
            setStep(2);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setPreview(null);
        setTitle('');
        setDescription('');
        setCategory('');
        setHashtags('');
        setStep(1);
        setError(null);
        setUploadProgress(0);
    };

    return (
        <>
            <Head>
                <title>Upload | PodStream</title>
            </Head>

            <div className="min-h-screen bg-gray-900 text-white">
                {/* Header */}
                <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800 z-50">
                    <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-gray-400 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </Link>
                            <h1 className="font-bold text-lg">Upload Video</h1>
                        </div>
                        {step === 2 && (
                            <button
                                onClick={handleUpload}
                                disabled={!title.trim() || isUploading}
                                className="px-6 py-2 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition"
                            >
                                Post
                            </button>
                        )}
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 py-8">
                    {/* Step 1: File Selection */}
                    {step === 1 && (
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            className="border-2 border-dashed border-gray-700 rounded-2xl p-12 text-center hover:border-pink-500 transition cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="video/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <div className="text-6xl mb-4">📹</div>
                            <h2 className="text-xl font-bold mb-2">Select video to upload</h2>
                            <p className="text-gray-400 mb-4">Or drag and drop a file</p>
                            <div className="text-sm text-gray-500 space-y-1">
                                <p>MP4, MOV, or WebM</p>
                                <p>720p or higher resolution</p>
                                <p>Up to 4 hours</p>
                                <p>Less than 10 GB</p>
                            </div>
                            <button className="mt-6 px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-lg font-bold transition">
                                Select File
                            </button>
                        </div>
                    )}

                    {/* Step 2: Video Details */}
                    {step === 2 && (
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Video Preview */}
                            <div>
                                <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative max-h-[500px]">
                                    <video
                                        ref={videoPreviewRef}
                                        src={preview}
                                        className="w-full h-full object-contain"
                                        controls
                                        autoPlay
                                        muted
                                        loop
                                    />
                                </div>
                                <button
                                    onClick={resetUpload}
                                    className="mt-4 text-gray-400 hover:text-white text-sm"
                                >
                                    ← Choose different video
                                </button>
                            </div>

                            {/* Details Form */}
                            <div className="space-y-6">
                                {error && (
                                    <div className="p-4 bg-red-500/20 border border-red-500/40 rounded-lg text-red-400">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Title <span className="text-pink-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Add a title that describes your video"
                                        maxLength={100}
                                        className="w-full px-4 py-3 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                    <p className="text-right text-sm text-gray-500 mt-1">
                                        {title.length}/100
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Tell viewers about your video"
                                        rows={4}
                                        maxLength={500}
                                        className="w-full px-4 py-3 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                                    />
                                    <p className="text-right text-sm text-gray-500 mt-1">
                                        {description.length}/500
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setCategory(cat.id)}
                                                className={`p-3 rounded-lg text-center transition ${category === cat.id
                                                    ? 'bg-pink-500'
                                                    : 'bg-gray-800 hover:bg-gray-700'
                                                    }`}
                                            >
                                                <span className="text-xl block">{cat.icon}</span>
                                                <span className="text-xs">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Hashtags</label>
                                    <input
                                        type="text"
                                        value={hashtags}
                                        onChange={(e) => setHashtags(e.target.value)}
                                        placeholder="#tech #tutorial #tips"
                                        className="w-full px-4 py-3 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        Separate with spaces
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={resetUpload}
                                        className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpload}
                                        disabled={!title.trim()}
                                        className="flex-1 py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 rounded-lg font-bold"
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Uploading */}
                    {step === 3 && (
                        <div className="text-center py-12">
                            <div className="w-32 h-32 mx-auto mb-6 relative">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#374151"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="#ec4899"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${uploadProgress * 2.83} 283`}
                                        className="transition-all duration-300"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold">{Math.round(uploadProgress)}%</span>
                                </div>
                            </div>
                            <h2 className="text-xl font-bold mb-2">
                                {uploadProgress < 100 ? 'Uploading...' : '✅ Upload Complete!'}
                            </h2>
                            <p className="text-gray-400">
                                {uploadProgress < 100
                                    ? 'Please wait while we process your video'
                                    : 'Redirecting to home...'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
