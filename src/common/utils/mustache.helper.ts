import Mustache from 'mustache';

export const renderTemplate = (
  template: string,
  variables: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
) => Mustache.render(template, variables);
