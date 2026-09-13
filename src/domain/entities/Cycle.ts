import { DateOnly } from "../valueObjects/DateOnly";

export interface CycleProps {
  id: string;
  startDate: DateOnly;
  endDate: DateOnly | null;
  isEarlyOrLateAdjusted: boolean;
}

/**
 * Cycle - Aggregate Root of the "Menstrual Tracking" bounded context.
 *
 * Invariants enforced here:
 *  - startDate is always required (a cycle cannot exist without a start).
 *  - endDate, when present, can never be before startDate.
 *  - A cycle is "open" (ongoing bleeding) while endDate is null.
 *
 * All mutation methods return a NEW Cycle instance (immutability) so the
 * Application layer (Pinia stores) can rely on reference-equality changes
 * to trigger reactivity and can persist the returned instance verbatim.
 */
export class Cycle {
  private constructor(private readonly props: CycleProps) {
    if (props.endDate && props.endDate.isBefore(props.startDate)) {
      throw new RangeError("Cycle endDate cannot be earlier than startDate.");
    }
  }

  public static start(input: { id: string; startDate: DateOnly }): Cycle {
    return new Cycle({
      id: input.id,
      startDate: input.startDate,
      endDate: null,
      isEarlyOrLateAdjusted: false,
    });
  }

  public static reconstitute(props: CycleProps): Cycle {
    return new Cycle(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get startDate(): DateOnly {
    return this.props.startDate;
  }

  public get endDate(): DateOnly | null {
    return this.props.endDate;
  }

  public get isOngoing(): boolean {
    return this.props.endDate === null;
  }

  /** Number of bleeding days; undefined while the cycle is still open. */
  public get periodLengthInDays(): number | null {
    if (!this.props.endDate) {
      return null;
    }
    return this.props.endDate.diffInDays(this.props.startDate) + 1;
  }

  /**
   * Closes the bleeding window for this cycle (user tapped "End period").
   */
  public endPeriod(endDate: DateOnly): Cycle {
    return new Cycle({ ...this.props, endDate, isEarlyOrLateAdjusted: false });
  }

  /**
   * Corrects the start date retroactively ("started earlier/later than
   * predicted"). Marking `isEarlyOrLateAdjusted` lets the prediction
   * service and UI surface a subtle "manually adjusted" indicator.
   */
  public correctStartDate(newStartDate: DateOnly): Cycle {
    return new Cycle({
      ...this.props,
      startDate: newStartDate,
      isEarlyOrLateAdjusted: true,
    });
  }

  public correctEndDate(newEndDate: DateOnly): Cycle {
    return new Cycle({
      ...this.props,
      endDate: newEndDate,
      isEarlyOrLateAdjusted: true,
    });
  }

  /**
   * Cycle length is a *derived* concept that only makes sense relative to
   * the cycle that follows it (length = days until the NEXT cycle starts).
   * It intentionally is not stored on the entity itself to avoid a
   * self-referential invariant; CyclePredictionService computes it from an
   * ordered collection of cycles.
   */
  public lengthUntil(nextCycle: Cycle): number {
    return nextCycle.startDate.diffInDays(this.props.startDate);
  }

  public toPlainObject(): CycleProps {
    return { ...this.props };
  }
}
