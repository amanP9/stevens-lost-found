const express = require("express");
const router = express.Router();
const { itemsDL } = require("../data");
const { checkId, helpers, validations } = require("../utils/helpers");
const { itemImageUpload } = require("../utils/multer");
const mongoCollections = require("./config/mongoCollections");
const Group50_Project_CS546 = mongoCollections.itemsCollection;

router.route("/listing/").get(async (req, res) => {
  // item listing page - paginated
  const data = await Group50_Project_CS546();
  try {
    if (!data) {
      return new Error("Data not found");
    }
  } catch (e) {
    console.log(e);
    return res.status(500).send(new Error(e.message));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = 5;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {};

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }
  if (endIndex < data.countDocuments().exec()) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }
  results.results = await data.find().limit(limit).skip(startIndex).exec();

  return res.render("listing", { results: results });
});

router.route("/my-listings").get(async (req, res) => {
  // my listing page - paginated
  return res.send("NOT IMPLEMENTED");
});

router
  .route("/add")
  .get(async (req, res) => {
    // create item page
    return res.render("item/create", {
      action: `/items/add`,
      metaData: {
        dateLostOrFound: {
          max: helpers.getDate(new Date()),
          min: helpers.getDate(
            new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          ),
        },
      },
    });
  })
  .post(
    (req, res, next) => itemImageUpload(req, res, next),
    async (req, res) => {
      let itemObj;
      try {
        itemObj = req.body;
        itemObj.picture = req?.file?.path;
      } catch (e) {
        console.log(e);
        return res.status(500).send(new Error(e.message));
      }

      try {
        if (!validations.isNameValid(itemObj?.name)) {
          throw new Error("Name field needs to have valid value");
        }
        itemObj.type = validations.isTypeValid(itemObj?.type);
        if (!itemObj.type) {
          throw new Error("Type field needs to have valid value");
        }
        if (!validations.isDateValid(itemObj?.dateLostOrFound)) {
          throw new Error("Date field needs to have valid value");
        }
        if (!validations.isLocationValid(itemObj?.lostOrFoundLocation)) {
          throw new Error("Location field needs to have valid value");
        }
      } catch (e) {
        console.log(e);
        return res.status(400).send(new Error(e.message));
      }

      try {
        const newItem = await itemsDL.createItem(itemObj);
        return res.send({
          success: true,
          message: "Item created!",
          data: newItem,
        });
      } catch (e) {
        console.log(e);
        return res.status(500).send(new Error(e.message));
      }
    }
  );

router
  .route("/edit/:id")
  .get(async (req, res) => {
    // edit item page
    let itemId;
    try {
      id = checkId(req.params.id, "Item ID");
    } catch (e) {
      return res.status(400).send(new Error(e.message));
    }

    try {
      // TODO replace dummy
      // let item = await itemsDL.getItemById(itemId);
      let item = {
        type: "found",
        name: "Pear Dao",
        description: "abcd",
        picture: "uploads/1669571684253_ReadyPlayerMe-Avatar.png",
        dateLostOrFound: helpers.getDate(new Date(1667580840000)),
        lostOrFoundLocation: "babio",
        comments: [],
        isClaimed: false,
        createdAt: 1669571707850,
        createdBy: "",
        updatedAt: 1669571707850,
        updatedBy: "",
      };

      return res.render("item/edit", {
        action: `/items/edit/${itemId}`,
        item,
        metaData: {
          dateLostOrFound: {
            max: helpers.getDate(new Date()),
            min: helpers.getDate(
              new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            ),
          },
        },
      });
    } catch (e) {
      res.status(404).json({ error: "Item not found" });
    }
  })
  .put(
    (req, res, next) => itemImageUpload(req, res, next),
    async (req, res) => {
      itemImageUpload(req, res, function (err) {
        if (err) {
          console.log("cs " + err);
          return;
        }
      });

      let itemId, itemObj;

      try {
        itemObj = req.body;
        itemObj.picture = req?.file?.path;
      } catch (e) {
        console.log(e);
        return res.status(500).send(new Error(e.message));
      }

      try {
        itemId = checkId(req.params.id, "Item ID");

        if (!validations.isNameValid(itemObj?.name)) {
          throw new Error("Name field needs to have valid value");
        }
        if (!validations.isDateValid(itemObj?.dateLostOrFound)) {
          throw new Error("Date field needs to have valid value");
        }
        if (!validations.isLocationValid(itemObj?.lostOrFoundLocation)) {
          throw new Error("Location field needs to have valid value");
        }
      } catch (e) {
        console.log(e);
        return res.status(400).send(new Error(e.message));
      }

      try {
        itemById = await itemsDL.getMovieById(movieId);
      } catch (e) {
        return res.status(404).json({ error: "Item not found" });
      }

      // TODO uncomment
      // if (helpers.compareItemObjects(itemById, itemObj)) {
      //   return res
      //     .status(400)
      //     .json({ error: "Please change atleast 1 value to update" });
      // }

      try {
        const updatedItem = await itemsDL.updateItem(itemId, itemObj);
        return res.json({
          success: true,
          message: "Item updated!",
          data: updatedItem,
        });
      } catch (e) {
        return res.status(500).send(new Error(e.message));
      }
    }
  );

router.route("/:id/comment").post(async (req, res) => {
  // add comment
  return res.send("NOT IMPLEMENTED");
});

router.route("/:id/status").put(async (req, res) => {
  // update isClaimed status
});

router
  .route("/:id")
  .get(async (req, res) => {
    // item page
    return res.send("NOT IMPLEMENTED");
  })
  .delete(async (req, res) => {
    // delete item
    return res.send("NOT IMPLEMENTED");
  });

module.exports = router;
