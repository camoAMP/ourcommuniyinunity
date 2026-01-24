"use client";

import React from "react"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, Loader2 } from "lucide-react";

const donationAmounts = [
  { value: "50", label: "R50" },
  { value: "100", label: "R100" },
  { value: "250", label: "R250" },
  { value: "500", label: "R500" },
  { value: "1000", label: "R1000" },
  { value: "custom", label: "Custom" },
];

const frequencies = [
  { value: "once", label: "One-time" },
  { value: "monthly", label: "Monthly" },
];

export function DonationForm() {
  const [amount, setAmount] = useState("250");
  const [customAmount, setCustomAmount] = useState("");
  const [frequency, setFrequency] = useState("once");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    anonymous: false,
    newsletter: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const donationAmount = amount === "custom" ? customAmount : amount;

    // This would integrate with Stripe/payment gateway
    console.log("Processing donation:", {
      amount: donationAmount,
      frequency,
      ...formData,
    });

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In production, redirect to Stripe Checkout
    alert(
      `Thank you for your ${frequency === "monthly" ? "monthly " : ""}donation of R${donationAmount}!`
    );
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-6 p-6">
          {/* Frequency */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Donation Frequency</Label>
            <RadioGroup
              value={frequency}
              onValueChange={setFrequency}
              className="flex gap-4"
            >
              {frequencies.map((freq) => (
                <div key={freq.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={freq.value} id={`freq-${freq.value}`} />
                  <Label htmlFor={`freq-${freq.value}`} className="cursor-pointer">
                    {freq.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Amount Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Amount</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {donationAmounts.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAmount(option.value)}
                  className={`rounded-lg border-2 p-3 text-center font-medium transition-all ${
                    amount === option.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-card-foreground hover:border-primary/50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {amount === "custom" && (
              <div className="mt-3">
                <Label htmlFor="customAmount">Enter Amount (ZAR)</Label>
                <Input
                  id="customAmount"
                  type="number"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  min="10"
                  required={amount === "custom"}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {/* Personal Details */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Your Details</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={formData.anonymous}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, anonymous: checked === true })
                }
              />
              <Label htmlFor="anonymous" className="cursor-pointer text-sm">
                Make my donation anonymous
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="newsletter"
                checked={formData.newsletter}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, newsletter: checked === true })
                }
              />
              <Label htmlFor="newsletter" className="cursor-pointer text-sm">
                Subscribe to our newsletter for updates
              </Label>
            </div>
          </div>

          {/* POPIA Notice */}
          <p className="text-xs text-muted-foreground">
            By donating, you agree to our{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>{" "}
            and{" "}
            <a href="/popia" className="underline hover:text-foreground">
              POPIA Compliance
            </a>
            . Your personal information will be processed in accordance with South
            African data protection laws.
          </p>

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="mr-2 h-5 w-5" />
                Donate R{amount === "custom" ? customAmount || "0" : amount}{" "}
                {frequency === "monthly" && "Monthly"}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
