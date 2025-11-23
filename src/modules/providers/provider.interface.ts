export interface Provider<
  TTemplate = unknown,
  TEvent = unknown,
  TMappedPayload = unknown,
  TResponse = unknown,
> {
  mapPayload(template: TTemplate, event: TEvent): TMappedPayload;
  send(mappedPayload: TMappedPayload): Promise<TResponse>;
}
