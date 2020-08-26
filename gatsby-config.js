module.exports = {
  siteMetadata: {
    title: 'Fantasy Draft Helper',
    titleTemplate: 'Fantasy Draft Helper',
    description: 'All in one tool for keeping track of your fantasy draft in real time.',
    url: 'https://www.fantasy.nateconroy.com',
    image: '/images/favicon.jpg',
    twitterUsername: '@NateConroy1',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-176408435-1',
      },
    },
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'src/images/favicon.png', // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};
