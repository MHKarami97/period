import type { IRandomSource } from "../IRandomSource";
import { StringList, type StringListOptions } from "../shared/StringList";
import { DEFAULT_ACTIONS, DEFAULT_BODY_PARTS } from "./defaultFaces";

const LIST_OPTIONS: StringListOptions = { minItems: 1, maxItems: 60, maxLength: 80 };

export interface DualDiceSnapshot {
  bodyParts: string[];
  actions: string[];
}

export interface DualDiceResult {
  action: string;
  bodyPart: string;
}

/**
 * DualDiceSettings - immutable Entity holding the faces of both dice.
 * Both lists always keep at least one face, so rolling can never fail.
 */
export class DualDiceSettings {
  private constructor(
    private readonly bodyPartList: StringList,
    private readonly actionList: StringList,
  ) {}

  public static defaults(): DualDiceSettings {
    return new DualDiceSettings(
      StringList.create(DEFAULT_BODY_PARTS, LIST_OPTIONS),
      StringList.create(DEFAULT_ACTIONS, LIST_OPTIONS),
    );
  }

  public static fromSnapshot(snapshot: DualDiceSnapshot): DualDiceSettings {
    const onlyStrings = (value: unknown): string[] =>
      Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    return new DualDiceSettings(
      StringList.create(onlyStrings(snapshot.bodyParts), LIST_OPTIONS),
      StringList.create(onlyStrings(snapshot.actions), LIST_OPTIONS),
    );
  }

  public get bodyParts(): string[] {
    return this.bodyPartList.toArray();
  }

  public get actions(): string[] {
    return this.actionList.toArray();
  }

  public withBodyPart(text: string): DualDiceSettings {
    return new DualDiceSettings(this.bodyPartList.add(text), this.actionList);
  }

  public withoutBodyPart(index: number): DualDiceSettings {
    return new DualDiceSettings(this.bodyPartList.removeAt(index), this.actionList);
  }

  public withAction(text: string): DualDiceSettings {
    return new DualDiceSettings(this.bodyPartList, this.actionList.add(text));
  }

  public withoutAction(index: number): DualDiceSettings {
    return new DualDiceSettings(this.bodyPartList, this.actionList.removeAt(index));
  }

  public roll(random: IRandomSource): DualDiceResult {
    const actions = this.actionList.toArray();
    const bodyParts = this.bodyPartList.toArray();
    return {
      action: actions[random.nextInt(0, actions.length - 1)],
      bodyPart: bodyParts[random.nextInt(0, bodyParts.length - 1)],
    };
  }

  public toSnapshot(): DualDiceSnapshot {
    return { bodyParts: this.bodyPartList.toArray(), actions: this.actionList.toArray() };
  }
}
