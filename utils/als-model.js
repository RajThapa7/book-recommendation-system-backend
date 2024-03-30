class ALSModel {
  constructor(numUsers, numItems, latentFactors, iterations, lambda) {
    this.numUsers = numUsers;
    this.numItems = numItems;
    this.latentFactors = latentFactors;
    this.iterations = iterations;
    this.lambda = lambda;

    // Initialize user and item feature matrices randomly
    this.userFeatures = this.initializeMatrix(numUsers, latentFactors);
    this.itemFeatures = this.initializeMatrix(numItems, latentFactors);
  }

  initializeMatrix(rows, cols) {
    const matrix = [];
    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(Math.random());
      }
      matrix.push(row);
    }
    return matrix;
  }

  train(interactions) {
    for (let iter = 0; iter < this.iterations; iter++) {
      interactions.forEach((interaction) => {
        const { id:userId, _id:itemId, average_rating:rating } = interaction;
        console.log(userId, itemId, rating);
        // Check if itemId is within the bounds of itemFeatures array
        if (itemId >= 0 && itemId < this.numItems) {
          const itemFeatures = this.itemFeatures[itemId];
          console.log(itemFeatures);
          // Check if itemFeatures is defined and has the expected length
          if (itemFeatures && itemFeatures.length === this.latentFactors) {
            let numerator = 0;
            let denominator = 0;
            for (let i = 0; i < this.latentFactors; i++) {
              numerator += itemFeatures[i] * rating;
              denominator += itemFeatures[i] * itemFeatures[i];
            }
            const userFeature = this.userFeatures[userId];
            for (let i = 0; i < this.latentFactors; i++) {
              userFeature[i] = numerator / (denominator + this.lambda);
            }
          } else {
            // console.error(
            //   `itemFeatures for itemId ${itemId} is undefined or has incorrect length.`
            // );
          }
        } else {
          //   console.error(`Invalid itemId: ${itemId}`);
        }
      });
    }
  }

  predict(userId, itemId) {
    const userFeatures = this.userFeatures[userId];
    const itemFeatures = this.itemFeatures[itemId];
    let prediction = 0;
    for (let i = 0; i < this.latentFactors; i++) {
      prediction += userFeatures[i] * itemFeatures[i];
    }
    return prediction;
  }

  generateRecommendations(userId, numRecommendations) {
    const predictions = [];
    for (let itemId = 0; itemId < this.numItems; itemId++) {
      if (this.predict(userId, itemId) > 0) {
        predictions.push({ itemId, score: this.predict(userId, itemId) });
      }
    }
    predictions.sort((a, b) => b.score - a.score);
    return predictions.slice(0, numRecommendations);
  }
}

export default ALSModel;
