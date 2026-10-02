import './datasets/init_datasets';
import { trainDiseaseClassifier } from './training/train_disease_model';
import { trainChatbotClassifier } from './training/train_chatbot';

console.log("=================================================");
console.log("HEALTH.AI — ML & NLP MODEL TRAINING PIPELINE");
console.log("=================================================");

try {
  console.log("\n[1/2] Training Disease Prediction Model (Kaggle 4,920 records)...");
  const diseaseModel = trainDiseaseClassifier();
  console.log(`✓ Disease Model: Accuracy = ${(diseaseModel.metrics.accuracy * 100).toFixed(1)}%, Classes = ${diseaseModel.num_classes}, Features = ${diseaseModel.num_features}`);

  console.log("\n[2/2] Training AI Health Chatbot NLP Model...");
  const chatbotModel = trainChatbotClassifier();
  console.log(`✓ Chatbot Model: Accuracy = ${(chatbotModel.metrics.accuracy * 100).toFixed(1)}%, Intents = ${chatbotModel.classes.length}, Vocab Size = ${chatbotModel.num_features}`);

  console.log("\n=================================================");
  console.log("ALL LOCAL ML / NLP MODELS COMPILED SUCCESSFULLY!");
  console.log("=================================================");
} catch (err) {
  console.error("Training Pipeline Error:", err);
  process.exit(1);
}
