import { Injectable } from '@nestjs/common';
import {
  IncomingSlackEvent,
  IncomingSlackInteractivity,
  SlackEventHandlerConfig,
  SlackInteractivityHandlerConfig,
} from 'nestjs-slack-listener';
import { SlackService } from 'nestjs-slack';

@Injectable()
export class SlackEventService {
  private readonly slackEventHandler: SlackEventHandlerConfig[];
  private readonly slackInteractivityHandler: SlackInteractivityHandlerConfig[];
  constructor(private readonly slackService: SlackService) {
    this.slackEventHandler = [];
    this.slackInteractivityHandler = [];
  }

  addEventHandler(handler: SlackEventHandlerConfig) {
    this.slackEventHandler.push(handler);
  }

  addInteractivityHandler(handler: SlackInteractivityHandlerConfig) {
    this.slackInteractivityHandler.push(handler);
  }

  async handleSingleEvent(
    event: IncomingSlackEvent,
    handlerConfig: SlackEventHandlerConfig,
  ) {
    const { eventType, filter, handler } = handlerConfig;

    if (eventType) {
      if (event.event.type != eventType) {
        return;
      }
    }

    if (filter) {
      try {
        if (!filter(event)) {
          return;
        }
      } catch (e) {
        return;
      }
    }

    return handler(event);
  }

  async handleSingleInteractivity(
    payload: IncomingSlackInteractivity,
    handlerConfig: SlackInteractivityHandlerConfig,
  ) {
    const { actionId, filter, handler } = handlerConfig;

    if (actionId) {
      if (
        payload.actions.filter((action) => action.action_id == actionId)
          .length == 0
      ) {
        return;
      }
    }

    if (filter) {
      if (!filter(payload)) {
        return;
      }
    }

    return handler(payload);
  }

  async getSlackEventHandler(event: IncomingSlackEvent): Promise<any> {
    console.log('✅', event);
    return Promise.all(
      this.slackEventHandler.map(
        async (handlerConfig) =>
          await this.handleSingleEvent(event, handlerConfig),
      ),
    );
  }

  async getSlackInteractivity(
    payload: IncomingSlackInteractivity,
  ): Promise<any> {
    return Promise.all(
      this.slackInteractivityHandler.map(
        async (handlerConfig) =>
          await this.handleSingleInteractivity(payload, handlerConfig),
      ),
    );
  }
}
