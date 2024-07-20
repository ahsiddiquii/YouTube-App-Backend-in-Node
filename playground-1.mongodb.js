use("chaiAurBackend-1");

db.videos.aggregate([
  {
    $search: {
      index: "searchIndex",
      text: {
        query: "title = form",
        path: {
          wildcard: "*",
        },
      },
    },
  },
]);




