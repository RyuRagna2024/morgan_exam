// app/(public)/checkout/CheckoutForm.tsx

"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import Link from "next/link";

// Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

// Types
import { OrderInput } from "./order-types";

interface CheckoutFormProps {
  form: UseFormReturn<OrderInput>;
  onSubmit: (data: OrderInput) => Promise<void>;
  isSubmitting: boolean;
  hasItems: boolean;
}

export default function CheckoutForm({
  form,
  onSubmit,
  isSubmitting,
  hasItems,
}: CheckoutFormProps) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Billing Details Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Billing Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Captivity Branch */}
              <FormField
                control={form.control}
                name="captivityBranch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Captivity Branch*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="johannesburg">
                          Johannesburg
                        </SelectItem>
                        <SelectItem value="cape_town">Cape Town</SelectItem>
                        <SelectItem value="durban">Durban</SelectItem>
                        <SelectItem value="pretoria">Pretoria</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Collection Method */}
              <FormField
                control={form.control}
                name="methodOfCollection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collection Method*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="pickup">Pickup</SelectItem>
                        <SelectItem value="courier">Courier</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sales Rep */}
              <FormField
                control={form.control}
                name="salesRep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Rep</FormLabel>
                    <FormControl>
                      <Input placeholder="Sales rep name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Reference Number */}
              <FormField
                control={form.control}
                name="referenceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your reference" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* First Name */}
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Last Name */}
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company Name */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Country/Region */}
              <FormField
                control={form.control}
                name="countryRegion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country / Region*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="South Africa">
                          South Africa
                        </SelectItem>
                        <SelectItem value="Namibia">Namibia</SelectItem>
                        <SelectItem value="Botswana">Botswana</SelectItem>
                        <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Street Address */}
              <FormField
                control={form.control}
                name="streetAddress"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Street Address*</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="House number and street name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Apartment, Suite, etc. */}
              <FormField
                control={form.control}
                name="apartmentSuite"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Apartment, Suite, etc.</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Town/City */}
              <FormField
                control={form.control}
                name="townCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town / City*</FormLabel>
                    <FormControl>
                      <Input placeholder="Town/City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Province */}
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="gauteng">Gauteng</SelectItem>
                        <SelectItem value="western_cape">
                          Western Cape
                        </SelectItem>
                        <SelectItem value="kwazulu_natal">
                          KwaZulu-Natal
                        </SelectItem>
                        <SelectItem value="eastern_cape">
                          Eastern Cape
                        </SelectItem>
                        <SelectItem value="free_state">Free State</SelectItem>
                        <SelectItem value="mpumalanga">Mpumalanga</SelectItem>
                        <SelectItem value="limpopo">Limpopo</SelectItem>
                        <SelectItem value="north_west">North West</SelectItem>
                        <SelectItem value="northern_cape">
                          Northern Cape
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Postal Code */}
              <FormField
                control={form.control}
                name="postcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code*</FormLabel>
                    <FormControl>
                      <Input placeholder="Postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone*</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="Email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Additional Information</h2>

            <FormField
              control={form.control}
              name="orderNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Notes about your order, e.g. special notes for delivery"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Payment and Terms Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="font-medium mb-6">
              Pay upon Proforma Invoice receipt
            </p>

            <p className="text-gray-700 mb-6">
              Your personal data will be used to process your order, support
              your experience throughout this website, and for other purposes
              described in our privacy policy.
            </p>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="receiveEmailReviews"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal text-sm">
                      Check here to receive an email to review our products.
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreeTerms"
                render={({ field }) => (
                  <FormItem className="flex items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-normal text-sm">
                        I have read and agree to the website terms and
                        conditions*
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-md">
            <p className="text-amber-800 text-sm">
              Note: By placing your order, you agree to our terms and
              conditions. A proforma invoice will be sent to your email address.
            </p>
          </div>

          <div className="flex justify-between gap-4">
            <Link href="/cart">
              <Button
                variant="outline"
                className="w-full md:w-auto px-8"
                type="button"
              >
                Go to Cart
              </Button>
            </Link>

            <Button
              type="submit"
              className="w-full md:w-auto px-8 bg-black hover:bg-gray-800"
              disabled={isSubmitting || !hasItems}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
