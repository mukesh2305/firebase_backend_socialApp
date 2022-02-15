let db = {
    users: [
        {
            userId: 'a70R01IMkAMHfEmjyQO5JmKCCzt2',
            email: "user3@gmail.com",
            handle: "user3",
            createAt: "2020-01-01T00:00:00.000Z",
            imageUrl: "https://firebasestorage.googleapis.com/v0/b/socialapp-a416c.appspot.com/o/727486303187.jpg?alt=media",
            bio: "Hello my name is user3, nice to meet you",
            website: "https://user3.com",
            location: "London, UK",
        }
    ],
    screams: [
        {
            userHandle: 'user3',
            body: 'this is the scream body',
            createAt: "2022-01-21T11:41:46.756Z",
            likeCount: 5,
            commentCount: 2,
        }
    ],
    comments: [
        {
            userHandle: 'user3',
            screamId: 'mtG38KEO47PlZ3xnFZQp',
            body: 'nice one mate',
            createAt: "2022-01-21T11:41:46.756Z",
        }
    ],

    notification: [
        {
            recipient: 'user3',
            sender: 'john',
            read: 'true | false',
            screamId: 'mtG38KEO47PlZ3xnFZQp',
            type: 'like | comment',
            createAt: '2022-01-21T11:41:46.756Z'
        }
    ]
}

const userDetails = {
    // Redux data
    credentials: {
        userId: 'a70R01IMkAMHfEmjyQO5JmKCCzt2',
        email: "user3@gmail.com",
        handle: "user3",
        createAt: "2020-01-01T00:00:00.000Z",
        imageUrl: "https://firebasestorage.googleapis.com/v0/b/socialapp-a416c.appspot.com/o/727486303187.jpg?alt=media",
        bio: "Hello my name is user3, nice to meet you",
        website: "https://user3.com",
        location: "London, UK",
    },
    likes: [
        {
            userHandle: 'user3',
            screamId: 'mtG38KEO47PlZ3xnFZQp'
        },
        {
            userHandle: 'user',
            screamId: 'PAATbzUry4Cr2durRlDl',
        }
    ]
}