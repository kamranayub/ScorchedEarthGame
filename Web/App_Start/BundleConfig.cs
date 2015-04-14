using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace Web {
    public class BundleConfig {

        public static void RegisterBundles(BundleCollection bundles) {

            bundles.Add(new Bundle("~/_styles/game").Include(
                "~/styles/font-awesome/font-awesome.css",
                "~/styles/game.css"));

            bundles.Add(new Bundle("~/_scripts/game").Include(
                "~/scripts/Excalibur.js",
                "~/scripts/game.js"));

        }

    }
}