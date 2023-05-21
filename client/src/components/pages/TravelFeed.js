import React from "react"
import "../../styles/TravelFeed.css";
import { useQuery } from '@apollo/client';
import { GET_ALL_POSTS } from '../../utils/queries';
import Post from '../Post';

export default function TravelFeed() {
    const { loading, data } = useQuery(GET_ALL_POSTS);
    const posts = data?.getAllPosts || [];

    return (
        <>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <Post posts={posts} />
            )}
        </>
    );
}