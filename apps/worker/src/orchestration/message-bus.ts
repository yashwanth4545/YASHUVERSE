import type {
  AgentId,
  AgentMessage,
  MessageAction,
} from "@yashuverse/contracts";

export type MessageHandler = (message: AgentMessage) => Promise<AgentMessage | void>;

export class AgentMessageBus {
  private handlers: Map<AgentId, MessageHandler> = new Map();
  private messageLog: AgentMessage[] = [];
  private pendingRequests: Map<
    string,
    {
      expectedRecipient: AgentId;
      resolve: (value: AgentMessage) => void;
      reject: (reason?: any) => void;
      timer: NodeJS.Timeout;
    }
  > = new Map();

  /**
   * Registers a message listener for an agent.
   */
  public registerAgent(agentId: AgentId, handler: MessageHandler): void {
    this.handlers.set(agentId, handler);
  }

  /**
   * Unregisters an agent listener.
   */
  public unregisterAgent(agentId: AgentId): void {
    this.handlers.delete(agentId);
  }

  /**
   * Sends an asynchronous message to a specific agent or broadcasts to all.
   */
  public async send<T = unknown>(message: AgentMessage<T>): Promise<void> {
    this.messageLog.push(message as AgentMessage<unknown>);

    // Check if this message is a response to an active requestResponse call
    if (this.pendingRequests.has(message.correlationId)) {
      const pending = this.pendingRequests.get(message.correlationId)!;
      if (message.recipient === pending.expectedRecipient && message.sender !== pending.expectedRecipient) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(message.correlationId);
        pending.resolve(message as AgentMessage<unknown>);
        return;
      }
    }

    if (message.recipient === "all") {
      const promises: Promise<any>[] = [];
      for (const [id, handler] of this.handlers.entries()) {
        if (id !== message.sender) {
          promises.push(
            handler(message as AgentMessage<unknown>).catch((err) => {
              console.error(`[AgentMessageBus] Handler error for broadcast to ${id}:`, err);
            })
          );
        }
      }
      await Promise.all(promises);
      return;
    }

    const handler = this.handlers.get(message.recipient);
    if (!handler) {
      console.warn(`[AgentMessageBus] No registered handler for recipient agent: ${message.recipient}`);
      return;
    }

    try {
      const response = await handler(message as AgentMessage<unknown>);
      if (response) {
        await this.send(response);
      }
    } catch (err: any) {
      console.error(`[AgentMessageBus] Error dispatching to ${message.recipient}:`, err);
      // Auto-reply with failure message
      const failureMsg: AgentMessage = {
        messageId: `err-${Date.now()}`,
        correlationId: message.correlationId,
        workflowId: message.workflowId,
        sender: message.recipient,
        recipient: message.sender,
        action: "TASK_FAILED",
        payload: { error: err.message },
        status: "processed",
        timestamp: new Date().toISOString(),
      };
      await this.send(failureMsg);
    }
  }

  /**
   * Direct Request-Response pattern with strict timeout guard.
   */
  public requestResponse<TReq = unknown, TRes = unknown>(
    workflowId: string,
    sender: AgentId,
    recipient: AgentId,
    action: MessageAction,
    payload: TReq,
    timeoutMs = 4000
  ): Promise<AgentMessage<TRes>> {
    const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const requestMsg: AgentMessage<TReq> = {
      messageId,
      correlationId,
      workflowId,
      sender,
      recipient,
      action,
      payload,
      status: "sent",
      timestamp: new Date().toISOString(),
    };

    return new Promise<AgentMessage<TRes>>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        reject(
          new Error(
            `Agent request from '${sender}' to '${recipient}' (action: ${action}) timed out after ${timeoutMs}ms`
          )
        );
      }, timeoutMs);

      this.pendingRequests.set(correlationId, {
        expectedRecipient: sender,
        resolve: resolve as (value: AgentMessage) => void,
        reject,
        timer,
      });

      this.send(requestMsg).catch((err) => {
        clearTimeout(timer);
        this.pendingRequests.delete(correlationId);
        reject(err);
      });
    });
  }

  /**
   * Retrieves message history for a specific workflow.
   */
  public getWorkflowMessages(workflowId: string): AgentMessage[] {
    return this.messageLog.filter((m) => m.workflowId === workflowId);
  }

  /**
   * Clears in-memory message history.
   */
  public clear(): void {
    for (const pending of this.pendingRequests.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error("AgentMessageBus was cleared"));
    }
    this.pendingRequests.clear();
    this.messageLog = [];
  }
}

export const defaultAgentMessageBus = new AgentMessageBus();
