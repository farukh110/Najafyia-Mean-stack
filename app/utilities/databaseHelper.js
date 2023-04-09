const mongoose = require('mongoose');
var configuration = require('../../config/configuration');
var logHelper = require('../utilities/logHelper');
var constants = require('../constants');
function getModelByName(modelKey) {
	console.log(modelKey);
	const modelData = constants.Database.Collections[modelKey];
	if (!modelData)
		throw new Error("Invalid parameters provided.")
	let model = require(modelData.modelFile);
	if (!model)
		throw new Error("No model found.")
	return model;
}
module.exports = {
	getItem: async function (modelKey, query, projectPayload, options) {
		try {
			let model = getModelByName(modelKey);
			return this.getSingleItem(model, query, projectPayload, options);
		} catch (error) {
			logHelper.logErrorToFile(
				'DATABASE_SERVICE.getItem: Error occured while getting single item in: ' +
				modelKey,
				error,
			);
			throw new Error(error);
		}
	},
	getItems: async function (modelKey, query, projectPayload, options) {
		try {
			let model = getModelByName(modelKey);
			return this.getManyItems(model, query, projectPayload, options);
		} catch (error) {
			logHelper.logErrorToFile(
				'DATABASE_SERVICE.getItems: Error occured while getting items in: ' +
				modelKey,
				error,
			);
			throw new Error(error);
		}
	},
	getSingleItem: async function (model, query, projectPayload, options) {
		try {
			if (typeof (model) == "string")
				model = getModelByName(model);
			logHelper.logInfoToFile(
				'DATABASE_SERVICE.getSingleItem: getting single item from: ' +
				model.collection.collectionName,
				query,
			);
			const result = projectPayload ? await model.findOne(query, projectPayload, options).lean() : await model.findOne(query, null, options).lean();
			if (result) {
				logHelper.logInfoToFile(
					'DATABASE_SERVICE.getSingleItem: Recieved query result from: ' +
					model.collection.collectionName,
					result,
				);
				return result;
			}
		} catch (error) {
			logHelper.logErrorToFile(
				'DATABASE_SERVICE.getSingleItem: Error occured while getting single item in: ' +
				model.collection.collectionName,
				error,
			);
		}
		return null;
	},
	getManyItems: async function (model, query, projectPayload, sortQuery) {
		try {
			if (typeof (model) == "string")
				model = getModelByName(model);
			logHelper.logInfoToFile(
				'DATABASE_SERVICE.getManyItems: getting many items from: ' +
				model.collection.collectionName,
				query,
			);

			let result = null;
			if (sortQuery)
				result = projectPayload ? await model.find(query, projectPayload).sort(sortQuery).lean() : await model.find(query).sort(sortQuery).lean();
			else
				result = projectPayload ? await model.find(query, projectPayload).lean() : await model.find(query).lean();

			if (result) {
				logHelper.logInfoToFile(
					'DATABASE_SERVICE.getManyItems: Recieved query result from: ' +
					model.collection.collectionName,
					result,
				);
				return result;
			}
		} catch (error) {
			logHelper.logErrorToFile(
				'DATABASE_SERVICE.getSingleItem: Error occured while getting many items in: ' +
				model.collection.collectionName,
				error,
			);
		}
		return null;
	},
	updateItem: async function (
		model,
		query,
		payload,
		upsert
	) {
		payload.updated = Date.now();
		try {
			if (typeof (model) == "string")
				model = getModelByName(model);
			logHelper.logInfoToFile(
				'DATABASE_SERVICE.updateItem: updating item in: ' +
				model.collection.collectionName,
				payload,
			);

			const updatedItem = await model.findOneAndUpdate(query, payload, {
				useFindAndModify: false,
				new: true,
				lean: true
			});

			if (updatedItem) {
				logHelper.logInfoToFile(
					'DATABASE_SERVICE.updateItem: Recieved updated item from: ' +
					model.collection.collectionName,
					query,
					payload,
					updatedItem
				);
				return updatedItem;
			}
			else {
				if (upsert != undefined && upsert) {
					payload.created = Date.now();

					return await this.insertItem(model, payload);
				}
			}
		} catch (error) {
			logHelper.logErrorToFile(
				'DATABASE_SERVICE.updateItem: Error occured while updating item in: ' +
				model.collection.collectionName,
				error,
			);
		}
		return null;
	},
	insertItem: async function (
		model,
		payload
	) {
		payload.updated = Date.now();
		payload.created = Date.now();

		try {
			if (typeof (model) == "string")
				model = getModelByName(model);
			logHelper.logInfo(
				'DATABASE_SERVICE.insertItem: inserting item in: ' +
				model.collection.collectionName,
				payload,
			);
			const result = await model.insertMany(payload, { ordered: true });
			if (result && result.length > 0)
				return result[0];

		} catch (error) {
			logHelper.logError(
				'DATABASE_SERVICE.insertItem: Error occured while inserting item in: ' +

				model.collection.collectionName,
				error,
			);
		}
		return null;
	},
	getAggregateItems: async function (
		model,
		payload
	) {


		try {
			if (typeof (model) == "string")
				model = getModelByName(model);
			logHelper.logInfo(
				'DATABASE_SERVICE.getAggregateItems: getting grouped items in: ' +
				model.collection.collectionName,
				payload,
			);
			const result = await model.aggregate(payload);
			if (result)
				return result;

		} catch (error) {
			logHelper.logError(
				'DATABASE_SERVICE.getAggregateItems: getting grouped items in: ' +
				model.collection.collectionName,
				error,
			);
		}
		return null;
	},
	updateManyItems: async function (
		model,
		query,
		payload
	) {
		payload.updated = Date.now();
		try {
			if (typeof (model) == "string")
				model = getModelByName(model);
			logHelper.logInfo(
				'DATABASE_SERVICE.updateManyItems: updating many items in: ' +
				model.collection.collectionName,
				payload,
			);

			const updatedItem = await model.updateMany(query, payload, {
				useFindAndModify: false,
				new: true,
				lean: true
			});

			if (updatedItem) {
				logHelper.logInfo(
					'DATABASE_SERVICE.updateManyItems: Recieved result from: ' +
					model.collection.collectionName,
					query,
					payload,
					updatedItem
				);
				return updatedItem;
			}
		} catch (error) {
			logHelper.logError(
				'DATABASE_SERVICE.updateManyItems: Error occured while updating many item in: ' +
				model.collection.collectionName,
				error,
			);
		}
		return null;
	}

}