package com.chedoparti.payment_service.service;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class PaymentMonitoringServiceImpl implements PaymentMonitoringService {

    @Autowired
    MeterRegistry meterRegistry;

    public void recordSuccessfulPayment() {
        meterRegistry.counter("payments.success").increment();
    }

    public void recordFailedPayment() {
        meterRegistry.counter("payments.failure").increment();
    }

    public void recordPaymentLatency(long duration) {
        meterRegistry.timer("payments.latency").record(duration, TimeUnit.MILLISECONDS);
    }
}
