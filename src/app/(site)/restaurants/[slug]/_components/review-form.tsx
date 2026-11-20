"use client";

import { useActionState, useId, useState } from "react";
import { submitReview } from "@/actions/review";
import { PixelStar } from "@/components/pixel/pixel-art";
import { Button } from "@/components/ui/button";
import { fieldClass, labelClass } from "@/components/ui/fields";
import { cn } from "@/lib/utils";
import { initialReviewState } from "@/lib/validation/review";

export function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const [state, formAction, pending] = useActionState(submitReview, initialReviewState);
  const uid = useId();
  const errors = state.fieldErrors ?? {};
  const [rating, setRating] = useState(Number(state.values?.rating) || 0);
  const [hover, setHover] = useState(0);
  const [len, setLen] = useState(state.values?.comment?.length ?? 0);

  return (
    <form action={formAction} className="space-y-6" noValidate>
      <input type="hidden" name="restaurantId" value={restaurantId} />

      <div className="hp-field" aria-hidden="true">
        <label htmlFor={`${uid}-website`}>Leave this empty</label>
        <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label htmlFor={`${uid}-name`} className={labelClass}>
          Name
        </label>
        <input
          id={`${uid}-name`}
          name="name"
          autoComplete="nickname"
          defaultValue={state.values?.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          className={fieldClass}
          maxLength={50}
        />
        {errors.name ? (
          <p id={`${uid}-name-error`} className="text-cabai-700 mt-2 text-sm font-bold">
            {errors.name}
          </p>
        ) : null}
      </div>

      <fieldset aria-describedby={errors.rating ? `${uid}-rating-error` : undefined}>
        <legend className={labelClass}>Rating</legend>
        <div
          className="flex flex-wrap items-center gap-1"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="cursor-pointer"
              onMouseEnter={() => setHover(value)}
            >
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "peer-focus-visible:outline-kunyit-400 block p-1 transition-opacity peer-focus-visible:outline-4 peer-focus-visible:outline-offset-2",
                  value <= (hover || rating) ? "opacity-100" : "opacity-25",
                )}
              >
                <PixelStar size={4} />
                <span className="sr-only">{value} out of 5</span>
              </span>
            </label>
          ))}
          <span className="font-eyebrow text-terong-700 ml-3 text-xs uppercase">
            {rating ? `${rating} / 5` : "Tap a star"}
          </span>
        </div>
        {errors.rating ? (
          <p id={`${uid}-rating-error`} className="text-cabai-700 mt-2 text-sm font-bold">
            {errors.rating}
          </p>
        ) : null}
      </fieldset>

      <div>
        <label htmlFor={`${uid}-comment`} className={labelClass}>
          Review
        </label>
        <textarea
          id={`${uid}-comment`}
          name="comment"
          rows={4}
          defaultValue={state.values?.comment}
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={errors.comment ? `${uid}-comment-error` : undefined}
          className={fieldClass}
          maxLength={500}
          onChange={(e) => setLen(e.target.value.length)}
        />
        <p className="text-terong-700 mt-2 text-right text-xs" aria-hidden="true">
          {len} / 500
        </p>
        {errors.comment ? (
          <p
            id={`${uid}-comment-error`}
            className="text-cabai-700 mt-2 text-sm font-bold"
          >
            {errors.comment}
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-5">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Submit review"}
        </Button>
        {state.status !== "idle" && state.message ? (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={
              state.status === "error"
                ? "text-cabai-700 text-sm font-bold"
                : "text-pandan-700 text-sm font-bold"
            }
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
