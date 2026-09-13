import { DateOnly } from "../valueObjects/DateOnly";

export interface ProfileProps {
  id: string;
  name: string;
  createdAt: DateOnly;
}

/**
 * Profile - Aggregate Root representing ONE tracked person (herself, or,
 * in partner mode, any person the partner supports: wife, sister,
 * daughter, etc.). Every Cycle and Symptom belongs to exactly one Profile;
 * this is what makes multi-person tracking from a single partner device
 * possible without mixing data between people.
 */
export class Profile {
  private constructor(private readonly props: ProfileProps) {
    if (props.name.trim().length === 0) {
      throw new Error("Profile name cannot be empty.");
    }
  }

  public static create(input: { id: string; name: string; createdAt?: DateOnly }): Profile {
    return new Profile({
      id: input.id,
      name: input.name.trim(),
      createdAt: input.createdAt ?? DateOnly.today(),
    });
  }

  public static reconstitute(props: ProfileProps): Profile {
    return new Profile(props);
  }

  public get id(): string {
    return this.props.id;
  }

  public get name(): string {
    return this.props.name;
  }

  public get createdAt(): DateOnly {
    return this.props.createdAt;
  }

  public rename(newName: string): Profile {
    return new Profile({ ...this.props, name: newName });
  }

  public toPlainObject(): ProfileProps {
    return { ...this.props };
  }
}
