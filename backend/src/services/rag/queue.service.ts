/**
 * RAG QUEUE SERVICE
 * Ensures sequential processing for Ollama stability
 * Prevents concurrent overload and timeouts
 */

interface QueueTask {
  id: string;
  question: string;
  resolve: (result: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

export class RAGQueueService {
  private static queue: QueueTask[] = [];
  private static isProcessing = false;
  private static maxQueueSize = 100;
  private static taskTimeout = 120000; // 2 minutes per task
  private static processedCount = 0;
  private static failedCount = 0;

  /**
   * Add question to queue and wait for result
   */
  static async enqueue(question: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Check queue size
      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error('Queue is full. Please try again later.'));
        return;
      }

      const task: QueueTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.queue.push(task);
      console.log(`📥 RAG Queue: Added task ${task.id} (queue size: ${this.queue.length})`);

      // Start processing if not already running
      if (!this.isProcessing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process queue sequentially
   */
  private static async processQueue() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    console.log('🔄 RAG Queue: Starting processing...');

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      
      try {
        console.log(`⚙️ Processing task ${task.id}: "${task.question.substring(0, 50)}..."`);
        
        // Import RAGService dynamically to avoid circular dependency
        const { RAGService } = await import('./rag.service');
        
        // Process with timeout
        const result = await Promise.race([
          RAGService.answerQuestion(task.question),
          this.createTimeout(this.taskTimeout)
        ]);

        task.resolve(result);
        this.processedCount++;
        console.log(`✅ Task ${task.id} completed (${this.processedCount} total)`);
        
      } catch (error: any) {
        this.failedCount++;
        console.error(`❌ Task ${task.id} failed:`, error.message);
        task.reject(error);
      }

      // Small delay between tasks to prevent overwhelming Ollama
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    this.isProcessing = false;
    console.log(`✅ RAG Queue: Processing complete (Success: ${this.processedCount}, Failed: ${this.failedCount})`);
  }

  /**
   * Create timeout promise
   */
  private static createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Task timeout after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Get queue statistics
   */
  static getStats() {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      processedCount: this.processedCount,
      failedCount: this.failedCount,
      successRate: this.processedCount > 0 
        ? (this.processedCount / (this.processedCount + this.failedCount) * 100).toFixed(1) + '%'
        : 'N/A'
    };
  }

  /**
   * Clear queue (emergency)
   */
  static clearQueue() {
    const count = this.queue.length;
    this.queue.forEach(task => {
      task.reject(new Error('Queue cleared by admin'));
    });
    this.queue = [];
    console.log(`🗑️ Cleared ${count} tasks from queue`);
  }
}
