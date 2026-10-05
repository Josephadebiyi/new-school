import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Course } from "../data/site";
import { CourseArt } from "./CourseArt";

export function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="glass sheen group flex h-full flex-col rounded-[26px] p-2.5 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(6,41,31,0.55)]"
    >
      <CourseArt kind={course.art} letters={course.letters} />
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <p className="flex flex-wrap items-center gap-x-2 text-[13px] font-medium text-sub">
          <span>{course.duration}</span>
          <span className="h-1 w-1 rounded-full bg-sub/50" />
          <span>{course.category}</span>
          <span className="h-1 w-1 rounded-full bg-sub/50" />
          <span>Online</span>
        </p>
        <h3 className="mt-3 font-display text-xl uppercase leading-tight text-ink">{course.short}</h3>
        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="btn-ghost !px-4 !py-2 text-[13px]">See details</span>
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-lime transition group-hover:rotate-45">
            <ArrowUpRight size={18} />
          </span>
        </div>
      </div>
    </Link>
  );
}
