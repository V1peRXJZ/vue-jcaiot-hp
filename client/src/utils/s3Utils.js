/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0

ABOUT THIS NODE.JS EXAMPLE: This example works with Version 3 (V3) of the AWS SDK for JavaScript,
which is scheduled for release later in 2020. The prerelease version of the SDK is available
at https://github.com/aws/aws-sdk-js-v3. The 'SDK for JavaScript Developer Guide' for V3 is also
scheduled for release later in 2020, and the topic containing this example will be hosted at
https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html.

Purpose:
s3_PhotoExample.js demonstrates how to manipulate photos in albums stored in an Amazon S3 bucket.

Inputs (replace in code):
- BUCKET_NAME
- REGION
- IDENTITY_POOL_ID

Running the code:
node s3_PhotoExample.js
*/
// snippet-start:[s3.JavaScript.photoAlbumExample.completeV3]
// snippet-start:[s3.JavaScript.photoAlbumExample.configV3]

// Load the required clients and packages
const {CognitoIdentityClient} = require("@aws-sdk/client-cognito-identity");
const {
    fromCognitoIdentityPool,
} = require("@aws-sdk/credential-provider-cognito-identity");
const {S3, ListObjectsCommand} = require("@aws-sdk/client-s3");

const REGION = process.env.VUE_APP_REGION; //REGION
// Initialize the Amazon Cognito credentials provider
const region = process.env.VUE_APP_REGION; //REGION
console.log(REGION);
console.log(region);

const s3 = new S3({
    region: REGION,
    credentials: fromCognitoIdentityPool({
        client: new CognitoIdentityClient({region}),
        identityPoolId: process.env.VUE_APP_IDENTITY_POOL_ID, // IDENTITY_POOL_ID
    }),
});

const albumBucketName = "jcaiot"; //BUCKET_NAME
// snippet-end:[s3.JavaScript.photoAlbumExample.configV3]
// snippet-start:[s3.JavaScript.photoAlbumExample.listAlbumsV3]

// A utility function to create HTML
function getHtml(template) {
    return template.join("\n");
}

// Make getHTML function available to the browser
window.getHTML = getHtml;

// List the photo albums that exist in the bucket
const listAlbums = async () => {
    try {
        const data = await s3.send(
            new ListObjectsCommand({Delimiter: "/", Bucket: albumBucketName})
        );

        if (data.CommonPrefixes === undefined) {
            const htmlTemplate = [
                "<p>You don't have any albums. You need to create an album.</p>",
                "<button onclick=\"createAlbum(prompt('Enter album name:'))\">",
                "Create new album",
                "</button>",
            ];
            document.getElementById("appXXX").innerHTML = htmlTemplate;
        } else {
            var albums = data.CommonPrefixes.map(function (commonPrefix) {
                var prefix = commonPrefix.Prefix;
                var albumName = decodeURIComponent(prefix.replace("/", ""));
                return getHtml([
                    "<li>",
                    "<span onclick=\"deleteAlbum('" + albumName + "')\">X</span>",
                    "<span onclick=\"viewAlbum('" + albumName + "')\">",
                    albumName,
                    "</span>",
                    "</li>",
                ]);
            });
            var message = albums.length
                ? getHtml([
                    "<p>Click an album name to view it.</p>",
                    "<p>Click the X to delete the album.</p>",
                ])
                : "<p>You do not have any albums. You need to create an album";
            const htmlTemplate = [
                "<h2>Albums</h2>",
                message,
                "<ul>",
                getHtml(albums),
                "</ul>",
                "<button onclick=\"createAlbum(prompt('Enter Album Name:'))\">",
                "Create new Album",
                "</button>",
            ];
            document.getElementById("appXXX").innerHTML = getHtml(htmlTemplate);
        }
    } catch (err) {
        return alert("There was an error listing your albums: " + err.message);
    }
};

// Make listAlbums function available to the browser
window.listAlbums = listAlbums;

// snippet-end:[s3.JavaScript.photoAlbumExample.listAlbumsV3]
// snippet-start:[s3.JavaScript.photoAlbumExample.createAlbumV3]

// Create an album in the bucket
const createAlbum = async (albumName) => {
    albumName = albumName.trim();
    if (!albumName) {
        return alert("Album names must contain at least one non-space character.");
    }
    if (albumName.indexOf("/") !== -1) {
        return alert("Album names cannot contain slashes.");
    }
    var albumKey = encodeURIComponent(albumName);
    try {
        const key = albumKey + "/";
        const params = {Bucket: albumBucketName, Key: key};
        const data = await s3.putObject(params);
        console.log(data);
        alert("Successfully created album.");
        viewAlbum(albumName);
    } catch (err) {
        return alert("There was an error creating your album: " + err.message);
    }
};

// Make createAlbum function available to the browser
window.createAlbum = createAlbum;

// snippet-end:[s3.JavaScript.photoAlbumExample.createAlbumV3]
// snippet-start:[s3.JavaScript.photoAlbumExample.viewAlbumV3]

// View the contents of an album

const viewAlbum = async (albumName) => {
    const albumPhotosKey = encodeURIComponent(albumName) + "/";
    try {
        const data = await s3.send(
            new ListObjectsCommand({
                Prefix: albumPhotosKey,
                Bucket: albumBucketName,
            })
        );
        if (data.Contents.length === 1) {
            var htmlTemplate = [
                "<p>You don't have any photos in this album. You need to add photos.</p>",
                '<input id="photoupload" type="file" accept="image/*">',
                '<button id="addphoto" onclick="addPhoto(\'' + albumName + "')\">",
                "Add photo",
                "</button>",
                '<button onclick="listAlbums()">',
                "Back to albums",
                "</button>",
            ];
            document.getElementById("appXXX").innerHTML = getHtml(htmlTemplate);
        } else {
            console.log(data);
            const href = "https://s3." + region + ".amazonaws.com/";
            const bucketUrl = href + albumBucketName + "/";
            const photos = data.Contents.map(function (photo) {
                const photoKey = photo.Key;
                console.log(photo.Key);
                const photoUrl = bucketUrl + encodeURIComponent(photoKey);
                return getHtml([
                    "<span>",
                    "<div>",
                    '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
                    "</div>",
                    "<div>",
                    "<span onclick=\"deletePhoto('" +
                    albumName +
                    "','" +
                    photoKey +
                    "')\">",
                    "X",
                    "</span>",
                    "<span>",
                    photoKey.replace(albumPhotosKey, ""),
                    "</span>",
                    "</div>",
                    "</span>",
                ]);
            });
            var message = photos.length
                ? "<p>Click  the X to delete the photo</p>"
                : "<p>You don't have any photos in this album. You need to add photos.</p>";
            const htmlTemplate = [
                "<h2>",
                "Album: " + albumName,
                "</h2>",
                message,
                "<div>",
                getHtml(photos),
                "</div>",
                '<input id="photoupload" type="file" accept="image/*">',
                '<button id="addphoto" onclick="addPhoto(\'' + albumName + "')\">",
                "Add photo",
                "</button>",
                '<button onclick="listAlbums()">',
                "Back to albums",
                "</button>",
            ];
            document.getElementById("appXXX").innerHTML = getHtml(htmlTemplate);
            document.getElementsByTagName("img")[0].remove();
        }
    } catch (err) {
        return alert("There was an error viewing your album: " + err.message);
    }
};
// Make viewAlbum function available to the browser
window.viewAlbum = viewAlbum;

// snippet-end:[s3.JavaScript.photoAlbumExample.viewAlbumV3]
// snippet-start:[s3.JavaScript.photoAlbumExample.addPhotoV3]

// Add a photo to an album
const addPhoto = async (albumName, file) => {
    try {
        const albumPhotosKey = encodeURIComponent(albumName) + "/";
        const data = await s3.send(
            new ListObjectsCommand({
                Prefix: albumPhotosKey,
                Bucket: albumBucketName,
                ACL: "public-read",
            })
        );
        console.log(data);
        const fileName = new Date().getTime() + "_" + file.name;
        const photoKey = albumPhotosKey + fileName;
        const uploadParams = {
            Bucket: albumBucketName,
            Key: photoKey,
            Body: file,
            ACL: "public-read"
        };
        try {
            const data = await s3.putObject(uploadParams);
            console.log(data);
            alert("Successfully uploaded photo.");
            // viewAlbum(albumName);
            let url = 'https://jcaiot.s3.ap-northeast-1.amazonaws.com/' + albumName + '/';
            return url + fileName;
        } catch (err) {
            return alert("There was an error uploading your photo: ", err.message);
        }
    } catch (err) {
        if (!file) {
            return alert("Choose a file to upload first.");
        }
    }
};
const addPictureInsidePost = async (file) => {

    try {
        const albumPhotosKey = encodeURIComponent("posts") + "/";
        const data = await s3.send(
            new ListObjectsCommand({
                Prefix: albumPhotosKey,
                Bucket: albumBucketName,
                ACL: "public-read",
            })
        );
        console.log(data);

        const fileName = new Date().getTime() + "_" + file.name;
        const photoKey = albumPhotosKey + fileName;
        const uploadParams = {
            Bucket: albumBucketName,
            Key: photoKey,
            Body: file,
            ACL: "public-read"
        };
        try {
            const data = await s3.putObject(uploadParams);
            console.log(data);
            alert("Successfully uploaded photo.");
            // viewAlbum(albumName);
            let url = 'https://jcaiot.s3.ap-northeast-1.amazonaws.com/posts/';
            return url + fileName;
        } catch (err) {
            return alert("There was an error uploading your photo: ", err.message);
        }
    } catch (err) {
        if (!file) {
            return alert("Choose a file to upload first.");
        }
    }
};
// Make addPhoto function available to the browser
window.addPhoto = addPhoto;
window.addPictureInsidePost = addPictureInsidePost;

// snippet-end:[s3.JavaScript.photoAlbumExample.addPhotoV3]
// snippet-start:[s3.JavaScript.photoAlbumExample.deletePhotoV3]

// Delete a photo from an album
const deletePhoto = async (albumName, photoKey) => {
    try {
        console.log(photoKey);
        const params = {Key: photoKey, Bucket: albumBucketName};
        const data = await s3.deleteObject(params);
        console.log(data);
        console.log("Successfully deleted photo.");
        viewAlbum(albumName);
    } catch (err) {
        return alert("There was an error deleting your photo: ", err.message);
    }
};
// Make deletePhoto function available to the browser
window.deletePhoto = deletePhoto;

// snippet-end:[s3.JavaScript.photoAlbumExample.deletePhotoV3]
// snippet-start:[s3.JavaScript.photoAlbumExample.deleteAlbumV3]

// Delete an album from the bucket
const deleteAlbum = async (albumName) => {
    const albumKey = encodeURIComponent(albumName) + "/";
    try {
        const params = {Bucket: albumBucketName, Prefix: albumKey};
        const data = await s3.listObjects(params);
        const objects = data.Contents.map(function (object) {
            return {Key: object.Key};
        });
        try {
            const params = {
                Bucket: albumBucketName,
                Delete: {Objects: objects},
                Quiet: true,
            };
            const data = await s3.deleteObjects(params);
            console.log(data);
            listAlbums();
            return alert("Successfully deleted album.");
        } catch (err) {
            return alert("There was an error deleting your album: ", err.message);
        }
    } catch (err) {
        return alert("There was an error deleting your album1: ", err.message);
    }
};
// Make deleteAlbum function available to the browser
window.deleteAlbum = deleteAlbum;

// snippet-end:[s3.JavaScript.photoAlbumExample.deleteAlbumV3]
// snippet-end:[s3.JavaScript.photoAlbumExample.completeV3]
//for units tests only
exports.listAlbums = listAlbums;
exports.createAlbum = createAlbum;
exports.viewAlbum = viewAlbum;
exports.addPhoto = addPhoto;
exports.addPictureInsidePost = addPictureInsidePost;
exports.deletePhoto = deletePhoto;
exports.deleteAlbum = deleteAlbum;