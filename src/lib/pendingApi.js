// Features whose backend endpoints don't exist yet. Each function keeps the
// final call signature so wiring the real endpoint is a one-line change.

export class FeatureUnavailableError extends Error {
  constructor(feature) {
    super(`${feature} is coming soon.`);
    this.name = "FeatureUnavailableError";
  }
}

// TODO: wire to the contact endpoint once the backend exposes it
// eslint-disable-next-line no-unused-vars
export const submitContactMessage = async (payload) => {
  throw new FeatureUnavailableError("Sending messages online");
};

// TODO: wire to the newsletter endpoint once the backend exposes it
// eslint-disable-next-line no-unused-vars
export const subscribeToNewsletter = async (email) => {
  throw new FeatureUnavailableError("Newsletter subscription");
};

// TODO: wire to the change-password endpoint once the backend exposes it
// eslint-disable-next-line no-unused-vars
export const changePassword = async ({ currentPassword, newPassword }) => {
  throw new FeatureUnavailableError("Changing your password");
};
