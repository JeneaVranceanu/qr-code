// release.config.js
module.exports = {
  branches: ["master"],
  plugins: [
    "@semantic-release/commit-analyzer", // determines the next version bump
    "@semantic-release/release-notes-generator", // generates changelog
    "@semantic-release/changelog", // commits the changelog file
    "@semantic-release/github" // publishes the release on GitHub
  ]
};
