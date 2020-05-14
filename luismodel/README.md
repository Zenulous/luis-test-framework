# Frames LUIS Model

This project is responsible for publishing the Frames dataset as a LUIS model.

# How to use

1. Create a new LUIS application in any region (this guide assumes West Europe)
2. Import `/deployment/templateLuisModel.json` as any version number.
3. Create a `.env` file in the root of this repository as follows:

```
LUIS_ENDPOINT=https://westeurope.api.cognitive.microsoft.com/luis/api/v2.0/apps/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/versions/xxx
LUIS_AUTHORING_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Make sure to match the right App ID and app version. The authoring key should be the key for an authoring resource, **not** the prediction key.
