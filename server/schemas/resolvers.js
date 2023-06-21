const { AuthenticationError } = require('apollo-server-express');
const { User, Trip, Post } = require('../models');
const { signToken } = require('../utils/auth');
const nodemailer = require('nodemailer');
require('dotenv').config();

const resolvers = {
    Query: {
        // Get logged-in user info
        me: async (parent, args, context) => {
            if (context.user || args.username) {
                return await User.findOne({ username: args.username || context.user.username }).populate('trips').populate({
                    path: 'trips',
                    populate: 'posts'
                }).populate('posts').populate('followers');
            }
            throw new AuthenticationError('You need to be logged in!');
        },

        // Get single user (to look at their profile page)
        getSingleUser: async (parent, { username }, context) => {
            return await User.findOne({ username }).populate('trips').populate('posts').populate('followers');
        },

        // Get all users in DB
        getAllUsers: async (parent, args) => {
            return await User.find({}).populate('trips').populate('posts').populate('followers');
        },

        // Get trips by single user (to populate trips list on profile page)
        getTripsByUser: async (parent, args, context) => {
            return await Trip.find({ 
                username: args.username || context.user.username
            }).populate('posts');
        },

        // Get single trip by ID
        getSingleTrip: async (parent, { tripId }, context) => {
            return await Trip.findOne({ _id: tripId }).populate('posts');
        },

        // Get all posts (travel feed) & sort from newest to oldest created
        getAllPosts: async (parent, args) => {
            return await Post.find({}).populate('comments').populate('tripId').populate('userId').populate('likes').sort({ createdAt: -1 });
        },

        // Get posts by single user (profile page)
        getPostsByUser: async (parent, { username }) => {
            return await Post.find({ username }).populate('comments').populate('tripId');
        },

        // Get all posts in single trip (profile page)
        getPostsByTrip: async (parent, { tripId }) => {
            return await Post.find({ tripId }).populate('comments').populate('tripId');
        },

        // Get single post by ID
        getSinglePost: async (parent, { postId }) => {
            return await Post.findOne({ _id: postId }).populate('comments').populate('tripId');
        },

        // Get comments based on postId (populate comments per post on travel feed)
        getCommentsOnPost: async (parent, { postId }) => {
            return await Post.findOne({ _id: postId }).populate('comments');
        },

        // Get user's followers
        getUsersFollowers: async (parent, { username }) => {
            const user = await User.findOne({ username }).populate('followers');
            return user.followers;
        },

        // Nodemailer email functionality
        getEmailUser: async (parent, args, context) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }
            if (args.username) {
                const recipient = await User.findOne({ username: args.username });
            
                let transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.REACT_APP_EMAIL,
                        pass: process.env.REACT_APP_EMAIL_PASSWORD
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });

                let info = transporter.sendMail({
                    from: process.env.REACT_APP_EMAIL,
                    to: recipient.email,
                    subject: `Journey Journals Contact: Message from ${context.user.username}`,
                    text: `${args.message}\n\n From ${context.user.username} (${context.user.email})`
                }, function (err, info) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    console.log('Message sent: ', info.response);
                });
                return;
            }
        },
    },

    Mutation: {
        // Login as existing user
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('No user found with this email address');
            }

            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },

        // Sign up as new user
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },

        // Edit logged-in user's profile bio and image
        editProfile: async (parent, args, context) => {
            const updatedUser = await User.findOneAndUpdate(
                { username: args.username || context.user.username },
                { $set: 
                    {
                        bio: args.bio,
                        profileImage: args.profileImage
                    } 
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            return updatedUser;
        },

        // Update user with another user as their follower
        addFollower: async (parent, args, context) => {
            const updatedUser = await User.findOneAndUpdate(
                { username: args.followUsername },
                {
                    $addToSet: {
                        followers: args.userId || context.user._id
                    }
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).populate('followers');
            return updatedUser;
        },

        // Remove user/follower from user
        removeFollower: async (parent, args, context) => {
            const updatedUser = await User.findOneAndUpdate(
                { username: args.blockUsername },
                {
                    $pull: {
                        followers: args.userId || context.user._id
                    }
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).populate('followers');
            return updatedUser;
        },

        // Add user's new trip
        addTrip: async (parent, args, context) => {
            // Create trip
            const trip = await Trip.create({
                location: args.location,
                username: args.username || context.user.username
            });

            // Add trip to User's trips
            await User.findOneAndUpdate(
                { username: args.username || context.user.username },
                {
                    $addToSet: {
                        trips: trip
                    }
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).populate('trips');
            return trip;
        },

        // Delete user's trip
        deleteTrip: async (parent, args, context) => {
            // Delete trip
            const trip = await Trip.findOneAndDelete({ _id: args.tripId });

            // Update User's trips field
            await User.findOneAndUpdate(
                { username: args.username || context.user.username },
                { $pull: { trips: { _id: args.tripId } } },
                { new: true }
            );

            // Delete all posts associated to that trip
            await Post.deleteMany({ tripId: args.tripId });

            return trip;
        },

        // Add post from certain trip
        addPost: async (parent, { postInfo }, context) => {
            // Create post
            const post = await Post.create({
                title: postInfo.title,
                description: postInfo.description,
                image: postInfo.image,
                username: postInfo.username || context.user.username,
                userId: postInfo.userId || context.user._id,
                tripId: postInfo.tripId
            });

            // Update Trip's posts field
            const updatedTrip = await Trip.findOneAndUpdate(
                { _id: postInfo.tripId },
                {
                    $addToSet: {
                        posts: post
                    }
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            // Update User's posts field
            const updatedUser = await User.findOneAndUpdate(
                { username: postInfo.username || context.user.username },
                {
                    $addToSet: {
                        posts: post
                    }
                },
                {
                    new: true,
                    runValidators: true,
                }
            );

            return post;
        },

        // Delete post from certain trip
        deletePost: async (parent, args, context) => {
            // Delete post
            const post = await Post.findOneAndDelete({ _id: args.postId });

            return post;
        },

        editPost: async (parent, args, context) => {
            const updatedPost = await Post.findOneAndUpdate(
                { _id: args.postId },
                { $set: 
                    {
                        title: args.title,
                        description: args.description,
                        image: args.postImage,
                        userId: context.user._id
                    }  
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).populate('userId');

            return updatedPost;
        },

        // Add comment to a post
        addComment: async (parent, args, context) => {
            const post = await Post.findOneAndUpdate(
                { _id: args.postId },
                {
                    $addToSet: {
                        comments: {
                            text: args.text,
                            username: args.username || context.user.username,
                            postId: args.postId
                        }
                    }
                },
                {
                    new: true,
                    runValidators: true,
                }
            ).populate('comments');
            return post;
        },

        // Delete comment from post
        deleteComment: async (parent, { commentId, postId }) => {
            return await Post.findOneAndUpdate(
                { _id: postId },
                { $pull: { comments: { _id: commentId } } },
                { new: true }
            ).populate('tripId');
        },

        toggleLikePost: async (parent, args, context) => {
            // Find post with same postId
            const post = await Post.findOne({ _id: args.postId });
            
            // If logged-in user has already liked post, remove their userId from likes field
            if (post.likes.includes(context.user._id)) {
                return await Post.findOneAndUpdate(
                    { _id: args.postId },
                    { $pull: {
                        likes: args.userId || context.user._id
                    } },
                    {
                        new: true,
                        runValidators: true,
                    }
                ).populate('likes');
            // If logged-in user has not already liked post, add userId to likes field
            } else {
                return await Post.findOneAndUpdate(
                    { _id: args.postId },
                    { $addToSet: {
                        likes: args.userId || context.user._id
                    } },
                    {
                        new: true,
                        runValidators: true,
                    }
                ).populate('likes');
            }
        }
    }
}

module.exports = resolvers;