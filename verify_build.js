const fs = require('fs');
const homeJs = fs.readFileSync('C:\Users\98203\Documents\熙熙小窝\xixi-mp\dist\pages\home\index.js', 'utf8');
console.log('Has /api/posts/:', homeJs.includes('/api/posts/'));
console.log('Has comment:', homeJs.includes('comment'));
console.log('Has currentUserAvatar:', homeJs.includes('currentUserAvatar'));
console.log('Has resolveImageUrl:', homeJs.includes('resolveImageUrl'));

// Check album
const albumJs = fs.readFileSync('C:\Users\98203\Documents\熙熙小窝\xixi-mp\dist\pages\album\index.js', 'utf8');
console.log('\nAlbum:');
console.log('Has resolveImageUrl:', albumJs.includes('resolveImageUrl'));
console.log('Has /api/albums:', albumJs.includes('/api/albums'));
console.log('Has /api/photos:', albumJs.includes('/api/photos'));

// Check anniversary
const annJs = fs.readFileSync('C:\Users\98203\Documents\熙熙小窝\xixi-mp\dist\pages\anniversary\index.js', 'utf8');
console.log('\nAnniversary:');
console.log('Has targetYear:', annJs.includes('targetYear'));
console.log('Has is_recurring:', annJs.includes('is_recurring'));
console.log('Has /api/anniversaries:', annJs.includes('/api/anniversaries'));

// Check profile
const profileJs = fs.readFileSync('C:\Users\98203\Documents\熙熙小窝\xixi-mp\dist\pages\profile\index.js', 'utf8');
console.log('\nProfile:');
console.log('Has resolveImageUrl:', profileJs.includes('resolveImageUrl'));
console.log('Has /api/auth/avatar:', profileJs.includes('/api/auth/avatar'));
console.log('Has /api/auth/profile:', profileJs.includes('/api/auth/profile'));
