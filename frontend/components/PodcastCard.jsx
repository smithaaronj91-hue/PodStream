import React from 'react';
import Link from 'next/link';

export default function PodcastCard({ podcast }) {
    return (
        <Link href={`/podcast/${podcast.id}`}>
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer">
                <div className="relative h-40 bg-gray-200">
                    {podcast.cover_image_url && (
                        <img
                            src={podcast.cover_image_url}
                            alt={podcast.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                    {podcast.is_premium && (
                        <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                            PREMIUM
                        </div>
                    )}
                </div>

                <div className="p-4">
                    <h3 className="font-bold text-sm text-gray-900 truncate mb-1">
                        {podcast.title}
                    </h3>
                    <p className="text-xs text-gray-600 truncate mb-2">
                        by {podcast.creator_name}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{podcast.total_episodes} episodes</span>
                        {podcast.average_rating && (
                            <span className="text-yellow-500">★ {podcast.average_rating}</span>
                        )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 line-clamp-2">
                            {podcast.description}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
