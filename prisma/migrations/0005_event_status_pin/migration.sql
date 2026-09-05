-- Draft → Pin → Publish. Pin is editorial queue only; public feeds stay published.
ALTER TYPE "EventStatus" ADD VALUE 'pin';
