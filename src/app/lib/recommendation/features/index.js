import { BaseFeature } from './base-feature';
import { MajorMatch } from './major-match';
import { MinorMatch } from './minor-match';
import { InterestOverlap } from './interest-overlap';
import { CategoryOverlap } from './category-overlap';
import { LikeHistory } from './like-history';
import { SaveHistory } from './save-history';
import { MembershipSimilarity } from './membership-similarity';

export { BaseFeature, MajorMatch, MinorMatch, InterestOverlap, CategoryOverlap, LikeHistory, SaveHistory, MembershipSimilarity };

/**
 * Creates the default set of feature extractors.
 * @returns {BaseFeature[]}
 */
export function createDefaultFeatures() {
  return [
    new MembershipSimilarity(),
    new MajorMatch(),
    new MinorMatch(),
    new InterestOverlap(),
    new CategoryOverlap(),
    new LikeHistory(),
    new SaveHistory(),
  ];
}
