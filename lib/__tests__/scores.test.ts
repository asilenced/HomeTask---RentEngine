import {
  walkingScore,
  drivingScore,
  urbanSuburbanIndex,
  computeScores,
} from "../scores";
import type { Amenity } from "@/types";

describe("walkingScore", () => {
  it("returns 0 for zero or negative count", () => {
    expect(walkingScore(0)).toBe(0);
    expect(walkingScore(-1)).toBe(0);
  });

  it("returns rounded score from count (max count 40)", () => {
    expect(walkingScore(1)).toBe(3); // (1/40)*100 = 2.5 -> 3
    expect(walkingScore(20)).toBe(50);
    expect(walkingScore(40)).toBe(100);
  });

  it("returns correct score just below cap (boundary)", () => {
    expect(walkingScore(39)).toBe(98); // (39/40)*100 = 97.5 -> 98
  });

  it("caps at 100", () => {
    expect(walkingScore(50)).toBe(100);
    expect(walkingScore(100)).toBe(100);
  });

  it("rounds fractional count to integer score", () => {
    expect(walkingScore(2)).toBe(5); // (2/40)*100 = 5
  });
});

describe("drivingScore", () => {
  it("returns 0 for zero or negative count", () => {
    expect(drivingScore(0)).toBe(0);
    expect(drivingScore(-1)).toBe(0);
  });

  it("returns rounded score from count (max count 150)", () => {
    expect(drivingScore(75)).toBe(50);
    expect(drivingScore(150)).toBe(100);
  });

  it("returns correct score just below cap (boundary)", () => {
    expect(drivingScore(149)).toBe(99); // (149/150)*100 = 99.33 -> 99
  });

  it("caps at 100", () => {
    expect(drivingScore(200)).toBe(100);
  });
});

describe("urbanSuburbanIndex", () => {
  it('returns "urban" when walking count >= 15', () => {
    expect(urbanSuburbanIndex(15, 0)).toBe("urban");
    expect(urbanSuburbanIndex(20, 10)).toBe("urban");
  });

  it('returns "suburban" when walking count >= 5 and < 15', () => {
    expect(urbanSuburbanIndex(5, 0)).toBe("suburban");
    expect(urbanSuburbanIndex(10, 100)).toBe("suburban");
    expect(urbanSuburbanIndex(14, 200)).toBe("suburban");
  });

  it('returns "rural" when walking count < 5', () => {
    expect(urbanSuburbanIndex(0, 0)).toBe("rural");
    expect(urbanSuburbanIndex(4, 100)).toBe("rural");
  });

  it("uses exact boundaries: 4 is rural, 5 is suburban, 14 is suburban, 15 is urban", () => {
    expect(urbanSuburbanIndex(4, 0)).toBe("rural");
    expect(urbanSuburbanIndex(5, 0)).toBe("suburban");
    expect(urbanSuburbanIndex(14, 0)).toBe("suburban");
    expect(urbanSuburbanIndex(15, 0)).toBe("urban");
  });

  it("ignores driving count (only walking count determines label)", () => {
    expect(urbanSuburbanIndex(10, 0)).toBe("suburban");
    expect(urbanSuburbanIndex(10, 1000)).toBe("suburban");
  });

  it("returns rural for negative walking count", () => {
    expect(urbanSuburbanIndex(-1, 100)).toBe("rural");
  });
});

describe("computeScores", () => {
  const mockAmenity: Amenity = {
    id: "node/1",
    name: "Test",
    type: "cafe",
    lat: 0,
    lon: 0,
    distance: 100,
  };

  function makeAmenities(n: number): Amenity[] {
    return Array.from({ length: n }, (_, i) => ({
      ...mockAmenity,
      id: `node/${i}`,
    }));
  }

  it("computes all three outputs from walking and driving lists", () => {
    const walking = makeAmenities(10); // 10/40 -> 25 walking score
    const driving = makeAmenities(75); // 75/150 -> 50 driving score
    const result = computeScores(walking, driving);

    expect(result.walkingScore).toBe(25);
    expect(result.drivingScore).toBe(50);
    expect(result.urbanSuburbanIndex).toBe("suburban"); // 10 >= 5, < 15
  });

  it("returns urban when walking count is high", () => {
    const result = computeScores(makeAmenities(20), makeAmenities(100));
    expect(result.urbanSuburbanIndex).toBe("urban");
  });

  it("returns rural and zero scores for empty lists", () => {
    const result = computeScores([], []);
    expect(result.walkingScore).toBe(0);
    expect(result.drivingScore).toBe(0);
    expect(result.urbanSuburbanIndex).toBe("rural");
  });

  it("handles only walking list populated (driving empty)", () => {
    const result = computeScores(makeAmenities(10), []);
    expect(result.walkingScore).toBe(25);
    expect(result.drivingScore).toBe(0);
    expect(result.urbanSuburbanIndex).toBe("suburban");
  });

  it("handles only driving list populated (walking empty)", () => {
    const result = computeScores([], makeAmenities(75));
    expect(result.walkingScore).toBe(0);
    expect(result.drivingScore).toBe(50);
    expect(result.urbanSuburbanIndex).toBe("rural");
  });

  it("handles single amenity in each list", () => {
    const result = computeScores(makeAmenities(1), makeAmenities(1));
    expect(result.walkingScore).toBe(3);
    expect(result.drivingScore).toBe(1); // (1/150)*100 = 0.67 -> 1
    expect(result.urbanSuburbanIndex).toBe("rural");
  });

  it("caps scores at 100 for large lists", () => {
    const result = computeScores(makeAmenities(100), makeAmenities(500));
    expect(result.walkingScore).toBe(100);
    expect(result.drivingScore).toBe(100);
    expect(result.urbanSuburbanIndex).toBe("urban");
  });
});
