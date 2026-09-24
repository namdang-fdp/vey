package com.dorriss.vey.infrastructure.messaging.kafka;

import java.util.concurrent.CompletableFuture;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

@Component
public class DomainEventPublisher {
  private final KafkaTemplate<String, Object> kafkaTemplate;

  public DomainEventPublisher(KafkaTemplate<String, Object> kafkaTemplate) {
    this.kafkaTemplate = kafkaTemplate;
  }

  public CompletableFuture<SendResult<String, Object>> publish(
      String topic, String partitionKey, Object event) {
    return kafkaTemplate.send(topic, partitionKey, event);
  }
}
